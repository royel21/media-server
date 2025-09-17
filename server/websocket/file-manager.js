import { fork } from "child_process";
import path from "path";
import winEx from "win-explorer";
import db from "#server/models/index";
import os from "node:os";
import { loadDisk } from "./diskloader.js";
let io;

const setSocket = (_io) => (io = _io);

let backupWorker;

const onBackup = (data) => {
  if (!backupWorker) {
    backupWorker = fork(appPath + "/workers/BackupWorker.js");
  }

  io.sockets.emit("info", { text: "Start Backup" });

  backupWorker.on("message", (data) => {
    io.sockets.emit("info", data);
  });

  backupWorker.on("exit", async () => {
    backupWorker = null;
    io.sockets.emit("reload-backups");
    io.sockets.emit("info", { text: "Finish Backup" });
  });

  backupWorker.send(data);
};

let imageWorker;
const cleanImagesDir = () => {
  if (!imageWorker) {
    imageWorker = fork(appPath + "/workers/ImagesCleaner.js");

    io.sockets.emit("info", { text: "Start to clean folder please wait" });

    imageWorker.on("message", (data) => {
      io.sockets.emit("info", data);
    });

    imageWorker.on("exit", async () => {
      imageWorker = null;
      io.sockets.emit("info", { text: "Finish Cleaning" });
    });

    imageWorker.send({ cleanup: true });
  } else {
    io.sockets.emit("info", { text: "Cleaning In process Pleaase Wait" });
  }
};

let worker = null;

const startWork = async (model, isFolder, user) => {
  if (!worker) {
    worker = fork(appPath + "/workers/BackgroundScan.js");

    io.sockets.emit("info", { text: "Scan Starting Please Wait" });

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

const resetRecent = async (data, user) => {
  if (data.Id && user) {
    const files = await db.file.findAll({ where: { FolderId: data.Id } });
    await db.recentFile.update({ LastPos: 0 }, { where: { FileId: files.map((f) => f.Id), UserId: user.Id } });
  }
  io.sockets.emit("reload", { Id: data.Id, user: user.Id });
};

const homedir = os.homedir();
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
      const dirInfo = winEx.ListFiles(Path.replace("homedir", homedir) || "", { oneFile: true });

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

  io.sockets.emit("info", { text: msg });
};

const sendEvents = ({ event, message }) => {
  io.sockets.emit(event, message);
};

let fileWorker;
const fileWork = (data) => {
  if (!fileWorker) {
    fileWorker = fork(appPath + "/workers/FileWorker.js");

    fileWorker.on("message", sendEvents);

    fileWorker.on("exit", () => {
      fileWorker = null;
    });
  }

  fileWorker.send(data);
};

let bgWorker = null;
const bgWork = (data) => {
  if (data.action === "bg-state") {
    return sendEvents({ event: "bg-worker-state", message: { isWorking: bgWorker !== null } });
  }

  if (!bgWorker) {
    bgWorker = fork(appPath + "/workers/bgWorker.js");

    bgWorker.on("message", sendEvents);

    bgWorker.on("exit", () => {
      bgWorker = null;
    });
  }

  bgWorker.send(data);
};

const hddLoader = () => loadDisk(io.sockets);

export default {
  fileWork,
  bgWork,
  onBackup,
  cleanImagesDir,
  scanDir,
  resetRecent,
  setSocket,
  hddLoader,
};
