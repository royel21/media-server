require("dotenv").config();
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const ThumbnailPath = process.env.IMAGES;

const WinDrive = require("win-explorer");
const db = require("../models");
const { genFolderThumbnails, genFileThumbnails } = require("./ThumbNailGenerator");

const ValidFiles = /\.(avi|avi2|mp4|mkv|ogg|webm|rar|zip)/i;

const IMGTYPES = /jpg|jpeg|png|gif|webp/i;

let DirectoryId;

const rmOrphanFiles = async (folder) => {
  const files = await folder.getFiles();
  for (const file of files) {
    if (folder.Path && file.Name) {
      if (!fs.existsSync(path.join(folder.Path, file.Name))) {
        await file.destroy();
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
    console.log("FolderCover:", error);
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
    Cover: "/Folder/" + Name + ".jpg",
    FilesType,
    CreatedAt: LastModified,
  });
};

const scanFolder = async (curfolder, files) => {
  let isNoNewFolder = true;

  let folder = await db.folder.findOne({ where: { Path: curfolder.Path } });

  let folderFiles = [];

  let filteredFiles = files.filter((f) => ValidFiles.test(f.Name) && !f.isHidden);

  if (folder) {
    await rmOrphanFiles(folder);
    if (folder.FileCount !== filteredFiles.length) {
      await folder.update({ FileCount: filteredFiles.length });
    }
    folderFiles = await folder.getFiles();
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
      tempFiles.push({
        Name: f.Name,
        Type: /rar|zip/gi.test(f.Extension) ? "Manga" : "Video",
        FolderId: folder.Id,
        Size: f.Size,
        CreatedAt: f.LastModified,
        Cover: `/Manga/${folder.Name}/${f.Name}.jpg`,
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

const scanDirectory = async ({ id, dir, isFolder }) => {
  DirectoryId = id;
  const fis = WinDrive.ListFilesRO(dir);
  let folder = WinDrive.ListFiles(dir, { oneFile: true });
  folder.Path = dir;
  console.log("scanning directory");
  await scanFolder(folder, fis);
  console.log("creating folder thumbnails");
  await genFolderThumbnails(foldersPendingCover);

  console.log("creating files thumbnails");

  let folders = await db.folder.findAll({
    order: ["Path"],
    where: isFolder ? { Id: id } : { DirectoryId: id }, // query base on FolderId or DirectoryId
    include: { model: db.file, order: ["Name"] },
  });

  await genFileThumbnails(folders);
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
