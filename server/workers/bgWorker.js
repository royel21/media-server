import path from "path";
import db from "../models/index.js";
import { moveFiles, transferFiles } from "./fileHelpers.js";
import { dirScan } from "./FolderWatcher.js";
import winExplorer from "win-explorer";
import { zipImgFolder, unZip } from "./zipHelper.js";

const sendMessage = (event, message) => {
  process.send({ event, message });
};

const renameFolder = async (datas) => {
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

  let msg = "Folder not found on DB";
  let success = false;

  if (folder) {
    let data;

    try {
      const Path = path.join(path.dirname(folder.Path), Name);

      data = { Name, Path, Description, Genres, Status, IsAdult: IsAdult || 0, AltName, Author, Server, EmissionDate };

      if (Transfer) {
        const dir = await db.directory.findOne({ where: { Id: DirectoryId } });
        if (dir) {
          const newPath = Path.replace(folder.Directory.FullPath, dir.FullPath);
          data.DirectoryId = DirectoryId;
          data.Path = newPath;

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
        }
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
  renameFolder,
  moveFiles,
  dirScan,
  folderSize,
  unZip,
  zipImgFolder,
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
