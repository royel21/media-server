import { genFolderThumbnails, genFileThumbnails } from "./ThumbNailGenerator.js";
import { config } from "dotenv";

config();

import sharp from "sharp";
import fs from "fs-extra";
import path from "path";
import WinDrive from "win-explorer";
import db from "../models/index.js";

let folders = [];

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
  process.send({ event, text });
};

const rmOrphanFiles = async (Id, isFolder, folder) => {
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
        await rmOrphanFiles(null, true, f);
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
  const FilesType = /rar|zip/gi.test(files[0].Extension) ? "mangas" : "videos";
  const FileCount = files.length;

  return db.folder.create({
    Name,
    Path,
    FileCount,
    DirectoryId,
    FilesType,
    CreatedAt: LastModified,
  });
};

const scanFolder = async (curfolder, files) => {
  let isNoNewFolder = true;

  let folder = folders.find((fd) => fd.Path === curfolder.Path);

  let folderFiles = [];

  let filteredFiles = files.filter((f) => ValidFiles.test(f.Name) && !f.isHidden);
  if (folder) {
    //if folder is alrady create update file count if needed
    if (folder.FileCount !== filteredFiles.length) {
      await folder.update({ FileCount: filteredFiles.length });
    }

    if (!folder.CreatedAt.Compare(curfolder.LastModified)) {
      folder.update({ CreatedAt: curfolder.LastModified });
    }

    folderFiles = await folder.Files;
  } else if (filteredFiles.length) {
    folder = await createFolder(curfolder, filteredFiles);

    isNoNewFolder = false;
  }

  if (folder && filteredFiles.length) {
    await createFolderThumbnail(folder, files);
  }

  let tempFiles = [];
  for (const f of files) {
    if (f.isDirectory) {
      await scanFolder(f, f.Files);
      //Check if file is in folder
    } else if (!folderFiles.find((fd) => fd.Name === f.Name) && ValidFiles.test(f.Name)) {
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
    console.log("create", curfolder.Name);
    await db.file.bulkCreate(tempFiles);

    if (isNoNewFolder) {
      await folder.update({ CreatedAt: new Date() });
    } else {
      folder.Files = await folder.getFiles();
    }
    folders.push(folder);
  }
};

const getFolders = async (id, isFolder) => {
  return db.folder.findAll({
    order: ["Path"],
    attributes: ["Id", "Name", "FileCount", "CreatedAt", "FilesType", "Path"],
    where: isFolder ? { Id: id } : { DirectoryId: id },
    include: { model: db.file, attributes: ["Id", "Name", "Type"] },
  });
};

const scanDirectory = async ({ id, dir, isFolder }) => {
  DirectoryId = id;
  console.log(dir);
  if (fs.existsSync(dir)) {
    const fis = WinDrive.ListFilesRO(dir);
    console.time("m1");
    let folder = WinDrive.ListFiles(dir, { oneFile: true });
    folder.Path = dir;

    folders = await getFolders(id, isFolder);
    console.timeEnd("m1");

    console.time("m2");
    sendMessage("cleaning direcory");
    await rmOrphanFiles(id, isFolder);
    console.timeEnd("m2");

    sendMessage("scanning directory");
    console.time("m3");
    await scanFolder(folder, fis);
    console.timeEnd("m3");
    sendMessage("creating folder thumbnails");
    await genFolderThumbnails(foldersPendingCover);

    sendMessage("creating files thumbnails");
    console.time("m4");

    await genFileThumbnails(folders, sendMessage);
    console.timeEnd("m4");
  } else {
    sendMessage("Not found:", dir);
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
