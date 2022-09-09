const { genFolderThumbnails, genFileThumbnails } = require("./ThumbNailGenerator");
require("dotenv").config();
const sharp = require("sharp");

const fs = require("fs-extra");
const path = require("path");
const WinDrive = require("win-explorer");
const db = require("../models");

const ThumbnailPath = process.env.IMAGES;

const ValidFiles = /\.(avi|avi2|mp4|mkv|ogg|webm|rar|zip)/i;

const IMGTYPES = /\.(jpg|jpeg|png|gif|webp)$/i;

let DirectoryId;

if (path.join(ThumbnailPath, "Folder")) {
  fs.mkdirsSync(path.join(ThumbnailPath, "Folder"));
  fs.mkdirsSync(path.join(ThumbnailPath, "Manga"));
  fs.mkdirsSync(path.join(ThumbnailPath, "Video"));
}

const rmOrphanFiles = async (Id, isFolder, folder) => {
  if (folder) {
    for (const file of folder.Files) {
      if (folder.Path && file.Name) {
        if (!fs.existsSync(path.join(folder.Path, file.Name))) {
          try {
            await file.destroy();
          } catch (error) {
            console.log(folder.Path, file.Name, error.toString());
          }
        } else if (!file.Cover) {
          await file.update({ Cover: `/${file.Type}/${folder.Name}/${file.Name}.jpg` });
        }
      }
    }
  } else {
    const folders = await db.folder.findAll({
      where: isFolder ? { Id } : { DirectoryId },
      include: { model: db.file, attributes: ["Id", "Name", "Type"] },
    });
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

    let note = files.filter((f) => /.json/.test(f.Name));
    if (note && folder.Description != note.Description) {
      await folder.update({ Description: note.Desctiption });
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
    //if folder is alrady create update file count if needed
    if (folder.FileCount !== filteredFiles.length) {
      await folder.update({ FileCount: filteredFiles.length });
    }

    if (!folder.CreatedAt.Compare(curfolder.LastModified)) {
      folder.update({ CreatedAt: curfolder.LastModified });
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
      const Type = /rar|zip/gi.test(f.Extension) ? "Manga" : "Video";
      tempFiles.push({
        Name: f.Name,
        Type,
        FolderId: folder.Id,
        Size: f.Size,
        CreatedAt: f.LastModified,
        Cover: `/${Type}/${folder.Name}/${f.Name}.jpg`,
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
  console.log("cleaning direcory");
  await rmOrphanFiles(id, isFolder);
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

module.exports = {
  scanDirectory,
};
