import path from "path";
import Sharp from "sharp";
import db from "../models/index.js";
import { createFolder, moveFiles, removeFiles, renFile, transferFiles } from "./fileHelpers.js";
import { remFolder, removeDFolder, workVideos } from "./videoHelper.js";
import { createDir } from "../Downloader/utils.js";
import defaultConfig from "../default-config.js";
import { dirScan } from "./FolderWatcher.js";
import winExplorer from "win-explorer";

const sendMessage = (event, message) => {
  process.send({ event, message });
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
    try {
      await file.update({ Name });
      success = true;
      msg = `File ${file.Name} was rename to ${Name} successfully`;
    } catch (err) {
      console.log(err);
      msg = `File ${Name} already exists`;
    }
  } else {
    msg = "File not found on db";
  }
  sendMessage("file-renamed", { success, msg, Name });
};
/************ Remove file from db and system ***********************/

const removeFile = async ({ Id, Del, viewer }) => {
  let files = await db.file.findAll({
    where: { Id },
    include: { model: db.folder },
  });

  const message = { success: false, msg: "", viewer };
  if (files.length) {
    let folder = files[0].Folder;

    for (let file of files) {
      try {
        await file.destroy({ Del });
        if (folder.FileCount) folder.FileCount--;

        message.success = true;
      } catch (err) {
        console.log(err);
        message.msg = "Server Error 500";
      }
    }
    //Update file count
    if (folder) {
      await folder.update({ FileCount: folder.FileCount });
    }
  } else {
    message.msg = "File not found on db";
  }
  sendMessage("file-removed", message);
};

const renameFolder = async (datas) => {
  const { Id, Name, Description, Genres, Status, IsAdult, AltName, Transfer, DirectoryId, Author, Server } = datas;
  let folder = await db.folder.findOne({
    where: { Id },
    include: { model: db.directory },
  });

  let msg = "Folder not found on DB";
  let success = false;

  if (folder) {
    let data;

    try {
      const Path = path.join(path.dirname(folder.Path), Name);

      data = { Name, Path, Description, Genres, Status, IsAdult: IsAdult || 0, AltName, Author, Server };

      if (Transfer) {
        const dir = await db.directory.findOne({ where: { Id: DirectoryId } });
        if (dir) {
          const newPath = folder.Path.replace(folder.Directory.FullPath, dir.FullPath);
          data.DirectoryId = DirectoryId;
          data.Path = newPath;
        }
        sendMessage("folder-renamed", {
          Id,
          success: true,
          msg: `Transfering: ${folder.Name} this may take some time please wait until completed message`,
          folder: { ...folder.dataValues },
          Transfer,
        });
        const result = await transferFiles(folder.Path, data.Path);
        if (!result.success) {
          return sendMessage("folder-renamed", { Id, success: false, msg: "Transfer folder fail" });
        }
        msg = `Folder: ${Name} was moved from ${folder.Directory.FullPath} to ${dir.FullPath}`;
      } else {
        msg = `Folder: ${Name} data was Updated`;
      }
      //add Completed id
      let gens = Genres?.split(", ").filter((g) => g !== "Completed") || [];
      if (Status) {
        gens.push("Completed");
        gens.sort();
      }
      data.Genres = gens.join(", ");

      await folder.update(data, { Transfer, Name });
      await folder.reload();
      success = true;
    } catch (error) {
      console.log(error);
    }

    sendMessage("folder-renamed", { Id, success, msg, data, folder: { ...folder.dataValues }, Transfer });
  } else {
    sendMessage("folder-renamed", { Id, success });
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
  sendMessage("folder-removed", { success, Id, Name: folder?.Name });
};

const createFolderThumb = async ({ folderId, file }) => {
  const folder = await db.folder.findOne({ where: { Id: folderId } });
  try {
    if (folder) {
      const posterPath = path.join(folder.Path, "Cover.jpg");

      createDir(folder.Path);

      const img = Sharp(Buffer.from(file.data));
      await img.jpeg().toFile(posterPath);

      let Cover = path.join(defaultConfig.ImagesDir, "Folder", folder.FilesType, folder.Name + ".jpg");

      createDir(path.join(defaultConfig.ImagesDir, "Folder", folder.FilesType));

      await img.toFormat("jpg").resize({ width: 340 }).toFile(Cover);
      console.log(Cover);
    }

    sendMessage("cover-update", { Id: folderId, valid: { text: `Cover update for: ${folder.Name}` } });
  } catch (error) {
    sendMessage("cover-update", { valid: { text: `Folder-Cover-Error: ${folder.Name}`, color: "Red", error } });
    console.log(error);
  }
};
const getFilesSize = (files) => {
  let size = 0;
  for (let file of files) {
    if (file.isDirectory) {
      size += getFilesSize(file.Files);
    } else {
      size += file.Size;
    }
  }

  return size;
};

const folderSize = ({ Name, Path }) => {
  const files = winExplorer.ListFilesRO(Path);
  let Size = (getFilesSize(files) / 1024 / 1024 / 1024).toFixed(2) + "GB";
  sendMessage("folder-size", { Name, Path, Size });
};

const actions = {
  renameFile,
  removeFile,
  renameFolder,
  removeFolder,
  workVideos,
  removeDFolder,
  // moveToDir,
  remFolder,
  moveFiles,
  removeFiles,
  createFolder,
  createFolderThumb,
  renFile,
  dirScan,
  folderSize,
};

const works = {
  isWorking: false,
  pendding: [],
};

const startToWork = async () => {
  works.isWorking = true;
  while (works.pendding.length) {
    const work = works.pendding.shift();
    if (actions[work.action]) {
      await actions[work.action](work.data);
    }
  }
  console.log("Finish File Work");
  process.exit();
};

process.on("message", (work) => {
  works.pendding.push(work);
  if (!works.isWorking) startToWork();
});
