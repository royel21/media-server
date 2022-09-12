const { fork } = require("child_process");
const drivelist = require("drivelist");
const fs = require("fs-extra");
const path = require("path");
const winEx = require("win-explorer");
const { nanoid } = require("nanoid");

var io;
var db;

const ImagesPath = process.env.IMAGES;

module.exports.setSocket = (_io, _db) => {
  io = _io;
  db = _db;
};

var worker = null;
const startWork = async (model, isFolder) => {
  if (!worker) {
    worker = fork(appPath + "/workers/BackgroundScan.js");

    worker.on("message", (data) => {
      io.sockets.emit("scan-finish", data);
    });

    worker.on("exit", async () => {
      worker = null;
      await db.directory.update({ IsLoading: false }, { where: { IsLoading: true } });

      io.sockets.emit("scan-finish", { all: true });
      console.log("scan-finish");
    });
  }

  let data = {
    id: model.Id,
    dir: isFolder ? model.Path : model.FullPath,
    isFolder,
  };

  await db.directory.update({ IsLoading: true }, { where: { Id: data.id } });
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
            Id: nanoid(5),
            Name: mp,
            Path: mp,
            Content: [],
          });
        }
      }
    });
    disks.sort((a, b) => a.Name.localeCompare(b.Name));
    io.sockets.emit("disk-loaded", disks);
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
        Id: nanoid(5),
        Name: d.Name,
        Path: path.join(data.Path, d.Name),
        Content: [],
      });
    }
    io.sockets.emit("content-loaded", { data: tdata, Id: data.Id });
  }
};
//Scan all files of a direcotry
module.exports.scanDir = async ({ Id, Path, Type, isFolder, IsAdult }) => {
  //If is it root of disk return;
  if (!Id && !Path) return io.sockets.emit("scan-info", "Id And Path both can't be null");

  let msg;
  try {
    let model;

    if (!Id) {
      let dirInfo = winEx.ListFiles(Path || "", { oneFile: true });

      if (dirInfo && !["c:\\", "C:\\", "/"].includes(Path)) {
        model = await db.directory.create({
          FullPath: Path,
          Name: dirInfo.Name,
          Type,
          IsAdult,
        });
      }
    } else {
      if (!isFolder) {
        model = await db.directory.findOne({ where: { Id } });
      } else {
        model = await db.folder.findOne({ where: { Id } });
      }
    }

    if (model) {
      if (model.IsLoading && worker) {
        msg = `Directory ${model.Name} is already scanning content`;
      } else {
        msg = `Directory ${model.Name} scanning content`;
        await startWork(model, isFolder);
      }
    } else {
      msg = "directory don't exist or can't add root of a disk";
    }
  } catch (err) {
    let error = err.errors;
    if (error) {
      msg = "Directory Already Added";
    } else {
      msg = "System error for more info verify log";
      console.log(err);
    }
  }

  io.sockets.emit("scan-info", msg);
  console.log(msg);
};
/****************** Rename File *******************/
module.exports.renameFile = async ({ Id, Name }) => {
  let file = await db.file.findOne({
    where: { Id },
    include: { model: db.folder },
  });
  let success = false;
  let msg = "File was not found";
  if (file) {
    let fromFile = path.join(file.Folder.Path, file.Name);
    let toFile = path.join(file.Folder.Path, Name);

    let fromCover = path.join(ImagesPath, file.Cover);
    let toCover = fromCover.replace(file.Name, Name);

    try {
      if (fs.existsSync(fromFile)) {
        fs.moveSync(fromFile, toFile);

        file.update({ Name, Cover: toCover });

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
      msg = err.toString();
    }
  } else {
    msg = "File not found on db";
  }
  io.sockets.emit("file-renamed", { success, msg, Name });
};
/************ Remove file from db and system ***********************/

module.exports.removeFile = async ({ Id, Del }) => {
  let file = await db.file.findOne({
    where: { Id },
    include: { model: db.folder },
  });

  const message = { success: false, msg: "" };

  if (file) {
    try {
      await file.destroy();
      message.success = true;
      if (Del) {
        let cover = path.join(ImagesPath, file.Cover);

        if (fs.existsSync(cover)) fs.removeSync(cover);

        let fPath = path.join(file.Folder.Path, file.Name);

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
  io.sockets.emit("file-removed", message);
};

const getCoverPath = (name) => path.join(ImagesPath, "Folder", name + ".jpg");

module.exports.renameFolder = async ({ Id, Name, Description, Genres, Status }) => {
  let folder = await db.folder.findOne({
    where: { Id },
    include: { model: db.directory },
  });

  let success = false;
  let msg = "Folder not found on DB";
  if (folder) {
    if (folder.Name !== Name) {
      try {
        let basePath = folder.Directory.FullPath;

        const oldPath = path.join(basePath, folder.Name);
        const Path = path.join(basePath, Name);
        const Cover = getCoverPath(Name);

        if (fs.existsSync(oldPath)) {
          fs.moveSync(oldPath, Path);
          msg = "Folder Rename Successfully";

          let oldCover = getCoverPath(folder.Name);
          if (fs.existsSync(oldCover)) fs.moveSync(oldCover, Cover);
        }

        await folder.update({ Name, Path, Cover, Description, Genres, Status });
        success = true;
      } catch (err) {
        console.log(err);
      }
    } else {
      success = true;
      await folder.update({ Description, Genres, Status });
    }
    await folder.reload();
    io.sockets.emit("folder-renamed", { Id, success, msg, folder: { ...folder.dataValues } });
  }
};

const getFileType = ({ FilesType }) => (FilesType === "mangas" ? "Manga" : "Video");

module.exports.removeFolder = async ({ Id, Del }) => {
  let folder = await db.folder.findByPk(Id);
  let success = false;
  if (folder) {
    try {
      if (Del) {
        //Remove Folder Thumbnail from images folder
        let cPath = getCoverPath(folder.Name);

        if (fs.existsSync(cPath)) {
          fs.removeSync(cPath);
        }

        //Remove files Thumbnails from images folder
        const imagesFolder = `${ImagesPath}/${getFileType(folder)}/${folder.Name}`;
        if (fs.existsSync(imagesFolder)) {
          fs.removeSync(imagesFolder);
        }

        //Remove All Files from Disk
        if (fs.existsSync(folder.Path)) {
          fs.removeSync(folder.Path);
        }
      }
      // remove from Database
      await folder.destroy();
      success = true;
    } catch (err) {
      console.log(err);
    }
  }
  io.sockets.emit("folder-removed", { success, Id });
};
