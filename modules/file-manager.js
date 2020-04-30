const { fork } = require("child_process");
const drivelist = require("drivelist");
const fs = require("fs-extra");
const path = require("path");
const winEx = require("win-explorer");

var io;
var socket;
var db;

module.exports.setSocket = (_io, _socket, _db) => {
  io = _io;
  socket = _socket;
  db = _db;
};

const getNewId = () => {
  return Math.random().toString(36).slice(-5);
};

var worker = null;
const startWork = (model) => {
  if (!worker) {
    worker = fork("./workers/BackgroundScan.js");

    worker.on("message", (data) => {
      io.sockets.emit("scan-finish", data);
    });

    worker.on("exit", () => {
      worker = null;
      db.directory
        .update({ IsLoading: false }, { where: { IsLoading: true } })
        .then(() => {
          io.sockets.emit("scan-finish", { all: true });
          console.log("scan-finish");
        });
    });
  }
  let data = { id: model.Id, dir: model.FullPath };
  worker.send(data);
};
// List all hdd
module.exports.diskLoader = () => {
  drivelist.list().then((drives) => {
    let disks = [];
    drives.forEach((drive) => {
      if (drive) {
        if (drive.mountpoints.length > 0) {
          let mp = drive.mountpoints[0].path;
          mp = mp === "/" ? "/home" : mp;
          disks.push({
            Id: getNewId(),
            Name: mp,
            Path: mp,
            Content: [],
          });
        }
      }
    });
    disks.sort((a, b) => a.Name.localeCompare(b.Name));
    socket.emit("disk-loaded", disks);
  });
};
//Load content of a folder
module.exports.loadContent = (data) => {
  //If is it root of disk return;
  if (fs.existsSync(data.Path)) {
    let dirs = winEx.ListFiles(data.Path, { directory: true });
    let tdata = [];
    for (let d of dirs) {
      tdata.push({
        Id: getNewId(),
        Name: d.FileName,
        Path: path.join(data.Path, d.FileName),
        Content: [],
      });
    }
    socket.emit("content-loaded", { data: tdata, Id: data.Id });
  }
};
//Scan all files of a direcotry
module.exports.scanDir = async ({ Id, Path }) => {
  //If is it root of disk return;
  if (!Id && !Path) return socket.emit("scan-info", "Id And Path both can't be null");

  let msg;
  try {
    let model;

    if (!Id) {
      let dirInfo = winEx.ListFiles(Path || "", { oneFile: true });

      if (dirInfo && !["c:\\", "C:\\", "/"].includes(Path)) {
        model = await db.directory.create({
          FullPath: Path,
          Name: dirInfo.FileName,
        });
      }
    } else {
      model = await db.directory.findOne({
        where: { Id },
      });
    }

    if (model) {
      if (model.IsLoading && worker) {
        msg = `Directory ${model.Name} is already scanning content`;
      } else {
        msg = `Directory ${model.Name} scanning content`;
        startWork(model);
      }
    } else {
      msg = "directory don't exist or can't add root of a disk";
    }
  } catch (err) {
    let error = err.errors;
    console.log(err);
    if (error) {
      msg = "Directory Already Added";
    } else {
      msg = "System error for more info verify log";
    }
  }

  socket.emit("scan-info", msg);
  console.log(msg);
};
/****************** Rename File *******************/
module.exports.renameFile = async ({ Id, Name }) => {
  let file = await db.file.findByPk(Id);
  let success = false;
  let msg = "File was not found";
  if (file) {
    let fromFile = path.join(file.FullPath, file.Name);
    let toFile = path.join(file.FullPath, Name);

    let fromCover = path.join("./images", file.Cover);
    let toCover = path.join(path.dirname(fromCover), Name + ".jpg");

    try {
      if (fs.existsSync(fromFile)) {
        fs.moveSync(fromFile, toFile);
        await db.file.update({ Name, Type: file.Type, Cover: "" }, { where: { Id } });
        success = true;
        if (fs.existsSync(fromCover)) {
          fs.moveSync(fromCover, toCover);
        }
        msg = `File ${file.Name} was rename to ${Name} successfully`;
      } else {
        msg = `File ${file.Name} not found on server`;
      }
    } catch (err) {
      console.log(err);
    }
  } else {
    msg = "File not found on db";
  }
  socket.emit("file-renamed", { success, msg, Name });
};
/************ Remove file from db and system ***********************/

module.exports.removeFile = async ({ Id, Del }) => {
  let file = await db.file.findByPk(Id);
  const message = { success: false, msg: "" };
  if (file) {
    try {
      await file.destroy();
      message.success = true;
      if (Del) {
        let cover = path.join(
          process.cwd(),
          "images",
          "covers",
          file.Type,
          file.Name + ".jpg"
        );
        if (fs.existsSync(cover)) fs.removeSync(cover);
        let fPath = path.join(file.FullPath, file.Name);
        if (fs.existsSync(fPath)) {
          fs.removeSync(fPath);
          message.msg = `File ${file.Name} removed from server`;
        } else {
          message.msg = `File Don't exit on server was only remove from db`;
        }
      } else {
        message.msg = `File ${file.Name} removed from DB`;
      }
    } catch (err) {
      console.log(err);
      message.msg = "Server Error 500";
    }
  } else {
    message.msg = "File not found on db";
  }
  socket.emit("file-removed", message);
};

const getCoverPath = (name) => {
  return path.join(process.cwd(), "images", "covers", "folder", name + ".jpg");
};

module.exports.renameFolder = async ({ Id, Name }) => {
  let folder = await db.folder.findOne({
    where: { Id },
    include: { model: db.directory },
  });
  let success = false;
  let msg = "Folder not found on system";
  if (folder) {
    try {
      let basePath = folder.Directory.FullPath;

      const oldPath = path.join(basePath, folder.Name);
      let FullPath = path.join(basePath, Name);
      if (fs.existsSync(oldPath)) {
        fs.moveSync(oldPath, FullPath);
        msg = "Folder Rename Successfully";
        db.file.update({ FullPath }, { where: { FolderId: Id } });

        let oldCover = getCoverPath(folder.Name);
        if (fs.existsSync(oldCover)) fs.moveSync(oldCover, getCoverPath(Name));
      }

      await folder.update({ Name });
      success = true;
    } catch (err) {
      console.log(err);
    }
    socket.emit("folder-renamed", { success, msg, Name });
  }
};

module.exports.removeFolder = async (Id) => {
  let folder = await db.folder.findByPk(Id);
  let success = false;
  if (folder) {
    try {
      await folder.destroy();
      success = true;

      let cPath = getCoverPath(folder.Name);
      if (fs.existsSync(cPath)) fs.removeSync(cPath);
    } catch (err) {
      console.log(err);
    }
  }
  socket.emit("folder-removed", { success });
};
