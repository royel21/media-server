import path from "path";
import Sharp from "sharp";
import db from "../models/index.js";
import { createFolder, removeFiles, renFile, bulkRename } from "./fileHelpers.js";
import { remFolder, removeDFolder, workVideos } from "./videoHelper.js";
import { createDir } from "../Downloader/utils.js";
import defaultConfig from "../default-config.js";

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

const actions = {
  renameFile,
  removeFile,
  removeFolder,
  workVideos,
  removeDFolder,
  bulkRename,
  remFolder,
  removeFiles,
  createFolder,
  createFolderThumb,
  renFile,
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
      const result = await actions[work.action](work.data);
      if (result) {
        await result();
      }
    }
  }
  console.log("Finish File Work");
  process.exit();
};

process.on("message", (work) => {
  works.pendding.push(work);
  if (!works.isWorking) startToWork();
});
