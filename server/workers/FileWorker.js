import path from "path";
import Sharp from "sharp";
import db from "#server/models/index";
import { createFolder, removeFiles, renameFile, bulkRename, moveFiles, transferFiles } from "./fileHelpers.js";
import { renameFolder, removeDFolder, workVideos } from "./videoHelper.js";
import { createDir } from "#server/Downloader/utils";
import defaultConfig from "#server/default-config";
import { dirScan } from "./FolderWatcher.js";
import { sendMessage } from "#server/utils";
import os from "os";

const homedir = os.homedir();

const renameDBFolder = async (datas) => {
  const {
    Id,
    Name,
    Description,
    Genres,
    Status,
    IsAdult,
    AltName,
    Transfer,
    DirectoryId,
    Author,
    Server,
    EmissionDate,
  } = datas;

  let folder = await db.folder.findOne({
    where: { Id },
    include: { model: db.directory },
  });

  let msg;
  const EVENT = "folder-renamed";
  let success = false;

  if (folder) {
    let data;

    try {
      const Path = path.join(path.dirname(folder.Path), Name);

      data = { Name, Path, Description, Genres, Status, IsAdult: IsAdult || 0, AltName, Author, Server, EmissionDate };

      const diff = [];
      for (let key of Object.keys(data)) {
        if (folder.dataValues[key] !== data[key]) {
          diff.push(key);
        }
      }

      if (Transfer) {
        const dir = await db.directory.findOne({ where: { Id: DirectoryId } });
        if (dir) {
          const newPath = Path.replace(folder.Directory.FullPath, dir.FullPath);
          data.DirectoryId = DirectoryId;
          data.Path = newPath;

          const moveMsg = `from ${folder.Directory.FullPath} to ${dir.FullPath}`;

          msg = `Transfering: ${folder.Name} ${moveMsg} this may take some time please wait until completed message`;
          await sendMessage({ msg }, EVENT);
          const src = folder.Path.replace("homedir", homedir);
          const dest = data.Path.replace("homedir", homedir);
          const result = await transferFiles(src, dest);

          if (!result.success) {
            return await sendMessage({ success: false, msg: "Transfer folder fail" }, EVENT);
          }
          msg = `Folder ${Name} was moved ${moveMsg}`;
        }
      } else {
        msg = `Folder ${Name} -> ${diff.join(", ")} was Updated`;
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

    await sendMessage({ Id, success, msg, data, folder: { ...folder.dataValues }, Transfer }, EVENT);
  } else {
    sendMessage({ msg: "Folder not found on DB", success: false }, EVENT);
  }
};

/****************** Rename File *******************/
const renameDBFile = async ({ Id, Name }) => {
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
  await sendMessage({ success, msg, Name }, "file-renamed");
};
/************ Remove file from db and system ***********************/

const removeDBFile = async ({ Id, Del, viewer }) => {
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
  await sendMessage(message, "file-removed");
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
  await sendMessage({ success, Id, Name: folder?.Name }, "folder-removed");
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

    await sendMessage({ Id: folderId, valid: { text: `Cover update for: ${folder.Name}` } }, "cover-update");
  } catch (error) {
    await sendMessage({ valid: { text: `Folder-Cover-Error: ${folder.Name}`, color: "Red", error } }, "cover-update");
    console.log(error);
  }
};

const actions = {
  renameDBFile,
  removeDBFile,
  renameDBFolder,
  removeDFolder,
  moveFiles,
  dirScan,
  removeFolder,
  removeFiles,
  workVideos,
  bulkRename,
  remFolder: renameFolder,
  createFolder,
  createFolderThumb,
  renameFile,
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
