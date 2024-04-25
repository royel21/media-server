import winex from "win-explorer";
import db from "../models/index.js";
import path from "node:path";
import defaulPath from "../path-config.js";

export const getDb = () => db;

export const destroy = async (data) => {
  try {
    await db.file.destroy(data, { Del: true });
  } catch (error) {
    console.log("destroy failed", error);
  }
};

export const findFolder = async (Name) => {
  return db.folder.findOne({ where: { Name } });
};

export const findOrCreateFolder = async (manga, IsAdult) => {
  let { Name, Description, Genres, AltName, Status, Server, Author } = manga;
  Genres = Genres?.replace(/(, |)Webtoon(, |)/gi, "");

  const Path = path.join(defaulPath.DownloadDir, IsAdult ? "R18/webtoon" : "mangas", Name);

  try {
    let folder = await db.folder.findOne({
      where: { Name, FilesType: "mangas" },
    });

    if (!folder) {
      let directory = await db.directory.findOne({
        where: { Name: IsAdult ? "webtoon" : "mangas" },
      });

      folder = await db.folder.create({
        Name,
        Path,
        Type: "Folder",
        FilesType: "mangas",
        CreatedAt: new Date(),
        DirectoryId: directory.Id,
        Description,
        Genres,
        AltName,
        IsAdult,
        Status,
        Server,
        Author,
      });
    }

    if (!folder.Description && Description) {
      await folder.update({ Description });
    }

    if (!folder.Server !== Server) {
      await folder.update({ Server });
    }

    if (!folder.Genres && Genres) {
      await folder.update({ Genres });
    }

    if (!folder.AltName && AltName) {
      await folder.update({ AltName });
    }

    if (!folder.Author && Author) {
      await folder.update({ Author });
    }

    await folder.update({ Status });

    return folder;
  } catch (error) {
    console.log(error.toString(), Name, Path);
    return null;
  }
};

export const createFile = async (file, FolderId, Duration) => {
  let f = winex.ListFiles(file, { oneFile: true });

  let found = await db.file.findOne({ where: { Name: f.Name, Type: "Manga", FolderId } });
  if (found) {
    await found.update({ Size: f.Size, CreatedAt: f.LastModified, Duration });
  } else {
    found = await db.file.create({
      Name: f.Name,
      Type: "Manga",
      FolderId,
      Size: f.Size,
      CreatedAt: f.LastModified,
      Duration,
    });
  }
  return found;
};
