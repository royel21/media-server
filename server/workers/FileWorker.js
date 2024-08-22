import db from "../models/index.js";
import { moveFiles, removeFiles } from "./fileHelpers.js";
import { moveToDir, remFolder, removeDFolder, workVideos } from "./videoHelper.js";

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
      const Path = folder.Path.replace(folder.Name, Name);

      data = { Name, Path, Description, Genres, Status, IsAdult: IsAdult || 0, AltName, Author, Server };

      if (Transfer) {
        const dir = await db.directory.findOne({ where: { Id: DirectoryId } });
        if (dir) {
          const newPath = folder.Path.replace(folder.Directory.FullPath, dir.FullPath);
          data.DirectoryId = DirectoryId;
          data.Path = newPath;
          msg = `Folder: ${Name} was moved from ${folder.Directory.FullPath} to ${dir.FullPath}`;
        }
        sendMessage("folder-renamed", {
          Id,
          success: true,
          msg: `Transfering: ${folder.Name} this may take time please wait until completed message`,
          folder: { ...folder.dataValues },
          Transfer,
        });
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

      await folder.update(data, { Name: folder.Name });
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
  sendMessage("folder-removed", { success, Id });
};

const actions = {
  renameFile,
  removeFile,
  renameFolder,
  removeFolder,
  workVideos,
  removeDFolder,
  moveToDir,
  remFolder,
  moveFiles,
  removeFiles,
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
  process.exit();
};

process.on("message", (work) => {
  works.pendding.push(work);
  if (!works.isWorking) startToWork();
});
