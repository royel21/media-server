import { fork } from "child_process";
import drivelist from "drivelist";
import fs from "fs-extra";
import path from "path";
import winEx from "win-explorer";
import { nanoid } from "nanoid";
import db from "../models/index.js";

var io;

const ImagesPath = process.env.IMAGES;

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
  if (/^([a-z]:\\|^\/)$/gi.test(path)) io.sockets.emit("scan-info", "Can't add root of a disk");

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

const removeFile = async ({ Id, Del }) => {
  let file = await db.file.findOne({
    where: { Id },
    include: { model: db.folder },
  });

  const message = { success: false, msg: "" };

  if (file) {
    try {
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
      await file.destroy();
      await file.Folder.update({ FileCount: file.Folder.FileCount - 1 });
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

const renameFolder = async ({ Id, Name, Description, Genres, Status }) => {
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

const removeFolder = async ({ Id, Del }) => {
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
