import { fork } from "child_process";
import drivelist from "drivelist";
import fs from "fs-extra";
import path from "path";
import winEx from "win-explorer";
import { nanoid } from "nanoid";
import db from "../models/index.js";
import diskusage from "diskusage";
import os from "node:os";

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
    console.log("info", "Start to clean folder please wait");

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

const sizeInGB = (size) => (size / 1024 / 1024 / 1024).toFixed(1) + "GB";
// List all hdd
const diskLoader = async () => {
  const drives = await drivelist.list();
  const disks = [];
  for (const drive of drives) {
    if (drive.mountpoints.length > 0) {
      let mp = drive.mountpoints[0];
      if (mp.path.includes("/boot")) continue;

      const data = await diskusage.check(mp.path);
      mp = mp === "/" ? "/home" : mp;

      disks.push({
        Id: nanoid(5),
        Name: `${mp.label ? mp.label : mp.path}`,
        Path: mp.path,
        Content: [],
        size: `free: ${sizeInGB(data.free)}<>Size: ${sizeInGB(data.total)}`,
      });
    }
  }
  disks.sort((a, b) => a.Name.localeCompare(b.Name));

  const hdata = await diskusage.check(os.platform() ? "/" : "C:\\");
  let diskData = [
    {
      Id: nanoid(5),
      Name: "Home",
      Path: `homedir`,
      Content: [],
      size: `free: ${sizeInGB(hdata.free)}<>Size: ${sizeInGB(hdata.total)}`,
    },
    ...disks,
  ];
  io.sockets.emit("disk-loaded", diskData);
};

const resetRecent = async (data, user) => {
  if (data.Id && user) {
    const files = await db.file.findAll({ where: { FolderId: data.Id } });
    await db.recentFile.update({ LastPos: 0 }, { where: { FileId: files.map((f) => f.Id), UserId: user.Id } });
  }
  io.sockets.emit("reload", { Id: data.Id, user: user.Id });
};

const homeDir = os.homedir();
//Scan all files of a direcotry
const scanDir = async ({ Id, Path, Type, isFolder, IsAdult }, user) => {
  if (Path.includes("homedir")) Path = Path.replace("homedir", homeDir);
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

  io.sockets.emit("info", { text: msg });
};

let fileWorker;
const fileWork = (action, data) => {
  if (!fileWorker) {
    fileWorker = fork(appPath + "/workers/FileWorker.js");

    fileWorker.on("message", ({ event, message }) => {
      io.sockets.emit(event, message);
    });

    fileWorker.on("exit", () => {
      fileWorker = null;
    });
  }

  fileWorker.send({ action, data });
};

export default {
  fileWork,
  onBackup,
  cleanImagesDir,
  scanDir,
  resetRecent,
  diskLoader,
  setSocket,
};
