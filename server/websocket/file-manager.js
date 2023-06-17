import { fork } from "child_process";
import drivelist from "drivelist";
import fs from "fs-extra";
import path from "path";
import winEx from "win-explorer";
import { nanoid } from "nanoid";
import db from "../models/index.js";

var io;

const setSocket = (_io) => (io = _io);

var worker = null;
const startWork = async (model, isFolder, user) => {
  if (!worker) {
    worker = fork(appPath + "/workers/BackgroundScan.js");

    worker.on("message", (data) => {
      if (data.event === "scan-finish") {
        io.sockets.emit("scan-finish", { Id: model.Id, user: user.Id });
      } else if (data.event === "info") {
        io.sockets.emit("info", { Id: model.Id, user: user.Id, ...data });
      } else {
        io.sockets.emit("reload", { Id: model.Id, user: user.Id });
      }
    });

    worker.on("exit", async () => {
      worker = null;
      await db.directory.update({ IsLoading: false }, { where: { IsLoading: true } });

      io.sockets.emit("scan-finish", { all: true });
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
const diskLoader = () => {
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

const resetRecent = async (data, user) => {
  if (user.Recent) {
    const files = await db.file.findAll({ where: { FolderId: data.Id } });
    await db.recentFile.update({ LastPos: 0 }, { where: { FileId: files.map((f) => f.Id), RecentId: user.Recent.Id } });
  }
  io.sockets.emit("reload", { Id: data.Id, user: user.Id });
};
//Load content of a folder
const loadContent = (data) => {
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
const scanDir = async ({ Id, Path, Type, isFolder, IsAdult }, user) => {
  //If is it root of disk return;
  if (!Id && !Path) return io.sockets.emit("scan-info", "Id And Path both can't be null");
  if (/^([a-z]:\\|^\/)$/gi.test(path)) return io.sockets.emit("scan-info", "Can't add root of a disk");

  let msg;
  try {
    let model;

    if (Id) {
      if (isFolder) {
        model = await db.folder.findOne({ where: { Id } });
      } else {
        model = await db.directory.findOne({ where: { Id } });
      }
    } else {
      const dirInfo = winEx.ListFiles(Path || "", { oneFile: true });

      if (dirInfo) {
        model = await db.directory.create({
          FullPath: Path,
          Name: dirInfo.Name,
          Type,
          IsAdult,
        });
      }
    }

    if (model) {
      if (model.IsLoading && worker) {
        msg = `Directory ${model.Name} is already scanning content`;
      } else {
        msg = `Directory ${model.Name} scanning content`;
        await startWork(model, isFolder, user);
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
const renameFile = async ({ Id, Name }) => {
  console.log("rename", Id, Name);
  let file = await db.file.findOne({
    where: { Id },
    include: { model: db.folder },
  });
  let success = false;
  let msg = "File was not found";
  if (file) {
    await file.update({ Name });
    success = true;
    msg = `File ${file.Name} was rename to ${Name} successfully`;
  } else {
    msg = "File not found on db";
  }
  io.sockets.emit("file-renamed", { success, msg, Name });
};
/************ Remove file from db and system ***********************/

const removeFile = async ({ Id, Del }) => {
  let file = await db.file.findOne({
    where: { Id },
    include: { model: db.folder },
  });

  const message = { success: false, msg: "" };

  if (file) {
    try {
      await file.destroy({ Del });
      if (file.Folder.FileCount > 1) {
        await file.Folder.update({ FileCount: file.Folder.FileCount - 1 });
      }
      message.success = true;
    } catch (err) {
      console.log(err);
      message.msg = "Server Error 500";
    }
  } else {
    message.msg = "File not found on db";
  }
  io.sockets.emit("file-removed", message);
};

const renameFolder = async ({ Id, Name, Description, Genres, Status, IsAdult, AltName, Transfer, DirectoryId }) => {
  let folder = await db.folder.findOne({
    where: { Id },
    include: { model: db.directory },
  });

  if (folder) {
    let data;
    let success = false;
    let msg = "Folder not found on DB";

    const Path = folder.Path.replace(folder.Name, Name);
    data = { Name, Path, Description, Genres, Status, IsAdult, AltName };

    if (Transfer) {
      const dir = await db.directory.findOne({ where: { Id: DirectoryId } });
      if (dir) {
        const newPath = folder.Path.replace(folder.Directory.FullPath, dir.FullPath);
        data.DirectoryId = DirectoryId;
        data.Path = newPath;
      }
    }

    try {
      await folder.update(data, { Name: folder.Name });
      await folder.reload();
      success = true;
    } catch (error) {
      console.log(error);
    }

    io.sockets.emit("folder-renamed", { Id, success, msg, folder: { ...folder.dataValues } });
  }
};

const removeFolder = async ({ Id, Del }) => {
  let folder = await db.folder.findByPk(Id);
  let success = false;

  try {
    // remove from Database and Disk
    if (folder) {
      await folder.destroy({ Del });
      success = true;
    }
  } catch (err) {
    console.log(err);
  }
  io.sockets.emit("folder-removed", { success, Id });
};

export default {
  removeFolder,
  renameFolder,
  removeFile,
  renameFile,
  scanDir,
  loadContent,
  resetRecent,
  diskLoader,
  setSocket,
};
