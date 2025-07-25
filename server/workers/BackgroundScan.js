import { genFolderThumbnails, genFileThumbnails } from "./ThumbNailGenerator.js";
import { config } from "dotenv";

config();

import path from "path";
import fs from "fs-extra";
import sharp from "sharp";
import WinDrive from "win-explorer";
import db from "#server/models/index";
import os from "os";

import { getFileType } from "#server/Downloader/utils";
import { createDefaultImageDirs } from "../utils.js";

let folders = [];
const homedir = os.homedir();

Date.prototype.Compare = function (d) {
  d = new Date(d);
  if (d instanceof Date) {
    return this.getTime() == d.getTime();
  }
};

const ValidFiles = /\.(avi|avi2|mp4|mkv|ogg|webm|rar|zip)/i;

const IMGTYPES = /\.(jpg|jpeg|png|gif|webp|jpe)$/i;

let DirectoryId;
let CoverPath;

const sendMessage = (text, event = "info") => {
  console.log(text);
  process.send({ event, text });
};

const rmOrphanFiles = async (folder) => {
  if (!folder) {
    for (const f of folders) {
      try {
        await rmOrphanFiles(f);
      } catch (error) {
        console.log(f.Name, error.toString());
      }
    }
    return;
  }

  const removed = [];

  if (fs.existsSync(folder?.Path)) {
    const tfiles = fs.readdirSync(folder.Path);

    const files = folder.Files.filter((f) => !tfiles.includes(f.Name));
    if (files.length) {
      for (const file of files) {
        try {
          console.log("Removing orphan file", file.Name);
          await file.destroy({ Del: true });
          removed.push(file.Id);
        } catch (error) {
          console.log(folder.Path, file.Name, error.toString());
        }
      }
    }
  }

  folder.Files = folder.Files.filter((f) => !removed.includes(f.Id));
  const imgs = folder.Files.map((f) => f.Name + ".jpg");
  const imageDir = path.join(CoverPath, getFileType(folder), folder.Name);

  if (fs.existsSync(imageDir)) {
    const founds = fs.readdirSync(imageDir).filter((f) => /jpg/.test(f));
    for (let img of founds) {
      if (!imgs.includes(img)) {
        try {
          fs.removeSync(path.join(imageDir, img));
        } catch (error) {}
      }
    }
  }
};
const foldersPendingCover = [];

const createFolderThumbnail = async (folder, files, isFolder) => {
  try {
    let coverPath = path.join(CoverPath, "Folder", folder.FilesType, folder.Name + ".jpg");

    if (!fs.existsSync(coverPath) || isFolder) {
      let img = files.find((f) => IMGTYPES.test(f.Name));
      //if folder contain a image use as thumbnailError
      if (img) {
        let imgPath = path.join(folder.Path, img.Name);
        await sharp(imgPath).jpeg().resize({ width: 340 }).toFile(coverPath);
      } else {
        //else push to list of folder for later process of thumbnail from first file
        const filePath = path.join(folder.Path.replace("homedir", homedir), files[0].Name);
        foldersPendingCover.push({ coverPath, filePath });
      }
    }
  } catch (error) {
    console.log("FolderCover:", folder.Name, error);
  }
};

const createFolder = async ({ Name, Path, LastModified }, files) => {
  const FilesType = /rar|zip/gi.test(files[0].Extension) ? "mangas" : "videos";
  const FileCount = files.length;
  const dir = await db.directory.findOne({ where: { Id: DirectoryId } });
  return db.folder.create({
    Name,
    Path: Path.replace(homedir, "homedir"),
    FileCount,
    DirectoryId,
    IsAdult: dir.IsAdult,
    FilesType,
    CreatedAt: LastModified,
  });
};

const scanFolder = async (curfolder, files, isFolder) => {
  let isNoNewFolder = true;

  let folder = folders.find((fd) => fd.Path === curfolder.Path.replace(homedir, "homedir"));

  let folderFiles = [];

  let filteredFiles = files.filter((f) => ValidFiles.test(f.Name) && !f.isHidden);
  if (folder) {
    //if folder is alrady create update file count if needed
    if (folder.FileCount !== filteredFiles.length) {
      await folder.update({ FileCount: filteredFiles.length });
    }

    const { LastModified } = curfolder;

    if (!folder.CreatedAt.Compare(LastModified)) {
      await folder.update({ CreatedAt: new Date(LastModified) });
    }

    folderFiles = await folder.Files;
  } else if (filteredFiles.length) {
    try {
      folder = await createFolder(curfolder, filteredFiles);
    } catch (error) {
      console.log("142: error-create-folder", error.toString());
      return;
    }
    isNoNewFolder = false;
  }

  if (filteredFiles.length) {
    // await createFolderThumbnail(folder, files, isFolder);
  }

  let tempFiles = [];
  for (const f of files) {
    const Size = f.Size / 1024 || 0;
    if (f.isDirectory) {
      await scanFolder(f, f.Files);
      //Check if file is in folder
    } else {
      const found = folderFiles.find((fd) => fd.Name.toLocaleLowerCase() === f.Name.toLocaleLowerCase());
      if (!found && ValidFiles.test(f.Name)) {
        const Type = /rar|zip/gi.test(f.Extension) ? "Manga" : "Video";

        tempFiles.push({
          Name: f.Name,
          Type,
          FolderId: folder.Id,
          Size,
          CreatedAt: f.LastModified,
        });
      } else if (found && found.Size !== Size) {
        await found.update({ Size });
      }
    }
  }

  if (tempFiles.length) {
    try {
      await db.file.bulkCreate(tempFiles);

      if (isNoNewFolder) {
        await folder.update({ CreatedAt: new Date() });
      }
      folder.Files = await folder.getFiles();
      folders.push(folder);
    } catch (error) {
      for (let file of tempFiles) {
        const found = folderFiles.find((fd) => fd.Name === file.Name);
        if (!found) {
          try {
            await db.file.create(file);
          } catch (error) {
            console.log("file error: ", file.Name);
          }
        }
      }
    }
  }
};

const getFolders = async (id, isFolder) => {
  return db.folder.findAll({
    order: ["Path"],
    attributes: ["Id", "Name", "FileCount", "CreatedAt", "FilesType", "Path", "Scanning", "Type"],
    where: isFolder ? { Id: id } : { DirectoryId: id },
    include: { model: db.file, attributes: ["Id", "Name", "Type", "Duration", "FolderId"] },
  });
};

const scanDirectory = async ({ id, dir, isFolder }) => {
  const appConfig = await db.AppConfig.findOne();

  CoverPath = appConfig.ImagesPath;

  if (fs.existsSync(path.join(CoverPath, "Manga"))) {
    createDefaultImageDirs(CoverPath);
  }

  DirectoryId = id;
  try {
    const nativePath = dir.replace("homedir", homedir);
    if (fs.existsSync(nativePath)) {
      sendMessage("Listing files");

      console.log("list-files");

      console.time("list-files");
      const fis = WinDrive.ListFilesRO(nativePath);

      if (fis.length === 0) {
        return sendMessage("Folder is Empty");
      }

      const folder = WinDrive.ListFiles(nativePath, { oneFile: true });
      folder.Path = nativePath;

      folders = await getFolders(id, isFolder);

      console.timeEnd("list-files");

      sendMessage("Cleanning Orpan File");
      console.time("Cleanning Orpan File");
      await rmOrphanFiles();
      console.timeEnd("Cleanning Orpan File");
      if (isFolder && folders[0]) {
        await folders[0].update({ Scanning: true });

        if (!fis.length) {
          await folders[0].update({ Scanning: false });
          // return sendMessage("Folder is Empty");
        }
      }

      sendMessage("Scanning directory");
      console.time("Scanning directory");
      await scanFolder(folder, fis, isFolder);
      console.timeEnd("Scanning directory");

      sendMessage("Creating folder thumbnails");
      await genFolderThumbnails(foldersPendingCover);

      sendMessage("Creating files thumbnails");
      console.time("Creating files thumbnails");

      await genFileThumbnails(folders, sendMessage);
      console.timeEnd("Creating files thumbnails");
      console.log("Job Finish");

      if (isFolder && folders[0]) {
        await folders[0].update({ Scanning: false });
      }
    } else {
      sendMessage("Not Exist: " + dir);
    }
  } catch (error) {
    console.log(error);
  }
  sendMessage("scan-finish", "scan-finish");
};

const pendingJobs = [];

const processJobs = async () => {
  await db.init();

  while (pendingJobs.length > 0) {
    let data = pendingJobs.pop();
    await scanDirectory(data);
    await db.directory.update({ IsLoading: false }, { where: { Id: data.id } });
    process.send(data);
  }
  process.exit();
};

let running = false;
process.on("message", (data) => {
  pendingJobs.push(data);
  db.directory.update({ IsLoading: true }, { where: { Id: data.id } });

  if (!running) {
    running = true;
    processJobs();
  }
});
