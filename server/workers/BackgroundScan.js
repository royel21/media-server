import { genFolderThumbnails, genFileThumbnails } from "./ThumbNailGenerator.js";
import { config } from "dotenv";

config();

import sharp from "sharp";
import fs from "fs-extra";
import path from "path";
import WinDrive from "win-explorer";
import db from "../models/index.js";

Date.prototype.Compare = function (d) {
  d = new Date(d);
  if (d instanceof Date) {
    return this.getTime() == d.getTime();
  }
};

const ThumbnailPath = process.env.IMAGES;

const ValidFiles = /\.(avi|avi2|mp4|mkv|ogg|webm|rar|zip)/i;

const IMGTYPES = /\.(jpg|jpeg|png|gif|webp)$/i;

let DirectoryId;

if (path.join(ThumbnailPath, "Folder")) {
  fs.mkdirsSync(path.join(ThumbnailPath, "Folder"));
  fs.mkdirsSync(path.join(ThumbnailPath, "Manga"));
  fs.mkdirsSync(path.join(ThumbnailPath, "Video"));
}

const sendMessage = (text, event = "info") => {
  // console.log(text);
  process.send({ event, text });
};

const rmOrphanFiles = async (folders, folder) => {
  if (folder) {
    const tfiles = fs.readdirSync(folder.Path);
    for (const file of folder.Files) {
      if (folder.Path && file.Name) {
        if (!tfiles.includes(file.Name)) {
          try {
            await file.destroy();
          } catch (error) {
            console.log(folder.Path, file.Name, error.toString());
          }
        }
      }
    }
  } else {
    for (const f of folders) {
      if (f.IsNoEmpty) {
        await rmOrphanFiles(null, f);
      } else {
        try {
          await f.destroy();
        } catch (error) {
          console.log(f.Name, error.toString());
        }
      }
    }
  }
};

const foldersPendingCover = [];

const createFolderThumbnail = async (folder, files) => {
  try {
    let CoverPath = path.join(ThumbnailPath, "Folder", folder.Name + ".jpg");

    if (!fs.existsSync(CoverPath)) {
      let img = files.find((f) => IMGTYPES.test(f.Name));
      //if folder contain a image use as thumbnail
      if (img) {
        let imgPath = path.join(folder.Path, img.Name);
        await sharp(imgPath).jpeg({ quality: 75 }).resize(240).toFile(CoverPath);
      } else {
        //else push to list of folder for later process of thumbnail from first file
        foldersPendingCover.push({
          folder: true,
          filePath: path.join(folder.Path, files[0].Name),
          CoverPath,
          FilesType: folder.FilesType,
        });
      }
    }
  } catch (error) {
    console.log("FolderCover:", folder.Name, error);
  }
};

const createFolder = async ({ Name, Path, LastModified }, files) => {
  let folder = {};
  try {
    const FilesType = /rar|zip/gi.test(files[0].Extension) ? "mangas" : "videos";
    const FileCount = files.length;
    const data = {
      Name,
      Path,
      FileCount,
      DirectoryId,
      FilesType,
      CreatedAt: LastModified,
    };
    folder = await db.folder.create(data);
  } catch (error) {
    console.log(Name, error.toString());
    folder = await db.folder.findOne({ where: { Name, Path } });
    await folder.destroy();
    folder = await db.folder.create(data);
  }
  return folder;
};

const scanFolder = async (curfolder, files, first, folders) => {
  let isNoNewFolder = true;

  let filteredFiles = files.filter((f) => ValidFiles.test(f.Name) && !f.isHidden);

  if (!filteredFiles.length && !first) {
    console.log(curfolder.Path);
    return;
  }

  let folder = folders.find((f) => f.Path === curfolder.Path || f.Name === curfolder.Name);

  if (folder) {
    //if folder is alrady create update file count if needed
    if (folder.FileCount !== filteredFiles.length) {
      await folder.update({ FileCount: filteredFiles.length });
    }

    if (!folder.CreatedAt.Compare(curfolder.LastModified)) {
      await folder.update({ CreatedAt: curfolder.LastModified });
    }
  } else if (filteredFiles.length) {
    folder = await createFolder(curfolder, filteredFiles);
    folder.Files = [];
    isNoNewFolder = false;
  }

  if (folder && filteredFiles.length) {
    await createFolderThumbnail(folder, files);
  }

  let tempFiles = [];
  for (const f of files) {
    if (f.isDirectory) {
      await scanFolder(f, f.Files, false, folders);
      //Check if file is in folder
    } else if (!folder.Files.find((fd) => fd.Name === f.Name) && ValidFiles.test(f.Name)) {
      const Type = /rar|zip/gi.test(f.Extension) ? "Manga" : "Video";
      tempFiles.push({
        Name: f.Name,
        Type,
        FolderId: folder.Id,
        Size: f.Size,
        CreatedAt: f.LastModified,
      });
    }
  }

  if (tempFiles.length) {
    await db.file.bulkCreate(tempFiles);
    if (isNoNewFolder) {
      await folder.update({ CreatedAt: new Date() });
    }
  }
};

const getFolders = async (id, isFolder) => {
  return db.folder.findAll({
    attributes: ["Id", "Name", "FileCount", "CreatedAt"],
    where: isFolder ? { Id: id } : { DirectoryId: id },
    include: { model: db.file, attributes: ["Id", "Name", "Type"] },
  });
};

export const scanDirectory = async ({ id, dir, isFolder }) => {
  DirectoryId = id;
  console.log(dir);
  if (fs.existsSync(dir)) {
    const fis = WinDrive.ListFilesRO(dir);
    let folder = WinDrive.ListFiles(dir, { oneFile: true });
    folder.Path = dir;
    sendMessage("cleaning direcory");

    console.time("time");
    let folders = await getFolders(id, isFolder);
    console.timeEnd("time");

    rmOrphanFiles(folders);

    sendMessage("scanning directory");
    console.time("time");
    await scanFolder(folder, fis, true, folders);
    console.timeEnd("time");
    sendMessage("Creating thumbnails");
    await genFolderThumbnails(foldersPendingCover);

    folders = await getFolders(id, isFolder);
    await genFileThumbnails(folders, sendMessage);
  } else {
    sendMessage("Direcotry Not found:" + dir);
  }
  sendMessage("scan-finish", "scan-finish");
};

const pendingJobs = [];

const processJobs = async () => {
  while (pendingJobs.length > 0) {
    let data = pendingJobs.pop();
    await scanDirectory(data);
    await db.directory.update({ IsLoading: false }, { where: { Id: data.id } });
    process.send(data);
  }
  process.exit();
};

var running = false;
process.on("message", (data) => {
  pendingJobs.push(data);
  db.directory.update({ IsLoading: true }, { where: { Id: data.id } });

  if (!running) {
    running = true;
    processJobs();
  }
});
