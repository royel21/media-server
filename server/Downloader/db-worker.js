import winex from "win-explorer";
import db from "../models/index.js";
import path from "node:path";
import { validAltName, validateAuthor, validGenres } from "#server/share/utils";

export const getDb = () => db;

export const destroy = async (data) => {
  try {
    await db.file.destroy({ ...data, Del: true, individualHooks: true });
  } catch (error) {
    console.log("destroy failed", error);
  }
};

const FilesType = "mangas";

export const findFolder = async (Name) => {
  return db.folder.findOne({ where: { Name, FilesType } });
};

export const findOrCreateFolder = async (manga, IsAdult, isRaw) => {
  let { Name, Description, Genres, AltName, Status, Server, Author } = manga;

  const genres = await db.Genres.findAll();

  const tags = genres.filter((g) => !g.IsRemove).map((g) => g.Name);
  const removeTags = genres.filter((g) => g.IsRemove).map((g) => g.Name);
  Genres = await validGenres(Genres, tags, removeTags);

  Author = validateAuthor(Author);

  AltName = validAltName(AltName);

  if (AltName.includes(Name)) {
    const regx = new RegExp(`(; |)${Name}( ;|)`, "i");
    AltName = AltName.replace(regx, "");
  }

  try {
    let folder = await db.folder.findOne({
      where: { Name, FilesType },
    });

    if (!folder) {
      const query = {
        where: { Name: Genres.includes("Manga") ? "Mangas" : "Webtoons", IsAdult },
      };

      if (Genres.includes("Raw") || isRaw) {
        query.where.Name = query.where.Name + " Raw";
      }

      let directory = await db.directory.findOne(query);

      folder = await db.folder.create({
        Name,
        Path: path.join(directory.FullPath, Name),
        Type: "Folder",
        FilesType,
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
    } else {
      if (!folder.Description && Description) {
        await folder.update({ Description });
      }

      if (folder.Server !== Server) {
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
    }

    return folder;
  } catch (error) {
    console.log(error.toString(), Name);
    return null;
  }
};

export const createFile = async (file, FolderId, Duration) => {
  let f = winex.ListFiles(file, { oneFile: true });

  let found = await db.file.findOne({ where: { Name: f.Name, Type: "Manga", FolderId } });
  if (found) {
    await found.update({ Size: f.Size / 1024, Duration });
  } else {
    found = await db.file.create({
      Name: f.Name,
      Type: "Manga",
      FolderId,
      Size: f.Size / 1024,
      CreatedAt: f.LastModified,
      Duration,
    });
  }
  return found;
};
