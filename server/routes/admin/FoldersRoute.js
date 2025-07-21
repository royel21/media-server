import Sharp from "sharp";
import fs from "fs-extra";
import path from "node:path";
import db from "#server/models/index";
import defaultConfig from "#server/default-config";

import { Router } from "express";
import { Op, literal } from "sequelize";
import { getFilter, getFilter2 } from "../utils.js";
import { createDir } from "#server/Downloader/utils";
import { cleanText } from "#server/utils";
import { homedir } from "node:os";

const routes = Router();

const getData = async (req, res) => {
  const { page, items, filter, folderId, dirId } = req.params;
  // calculate the start and end of the query check sql limit
  let limit = +items || 10;
  let offset = (page - 1) * limit || 0;

  const query = {
    attributes: ["Id", "Name", "Type"],
    order: [[literal(`REPLACE(REPLACE(Name, "-", "0"), '[','0')`)]], // used for natural ordering
    where: {},
    offset,
    limit,
  };

  let result;
  const appConfig = await db.AppConfig.findOne();
  const filters = getFilter(cleanText(filter || "", appConfig));

  // if contain folderId this is a file query we will need the folderId
  if (folderId) {
    query.where.FolderId = folderId;
    query.where.Name = filters;
    query.attributes = [...query.attributes, "Size", "CreatedAt"];
    query.order[0].push("DESC");
    result = await db.file.findAndCountAll(query);
  } else {
    if (dirId && dirId !== "all") {
      query.where.DirectoryId = dirId;
    }
    query.attributes = [...query.attributes, "Path", "Status", "FilesType", "Scanning"];

    const appConfig = await db.AppConfig.findOne();
    const text = cleanText(filter, appConfig);
    const filters2 = getFilter2(text, ["AltName", "Name", "Genres", "Author", "Server"]);
    query.where[Op.or] = filters2;
    result = await db.folder.findAndCountAll(query);

    result.rows = result.rows.map((fd) => {
      delete fd.dataValues.Name;
      return { ...fd.dataValues };
    });
  }

  let totalPages = Math.ceil(result.count / query.limit);

  res.send({
    items: result.rows,
    totalPages,
    totalItems: result.count,
  });
};

const getTags = async () => {
  const tags = await db.Genres.findAll({ order: ["Name"] });
  return tags.map((g) => ({ ...g.dataValues }));
};

routes.get("/dirs", async (req, res) => {
  const dirs = await db.directory.findAll({ order: [literal(`LOWER(FullPath)`)] });

  res.send({ tags: await getTags(), dirs: [...dirs.map((d) => d.dataValues)] });
});

routes.get("/folder-raw/:Id", async (req, res) => {
  const { Id } = req.params;
  const folder = await db.folder.findOne({ where: { Id } });
  const genres = folder?.Genres.split(", ");
  if (folder && !genres.includes("Raw")) {
    genres.push("Raw");
    genres.sort();
    folder.Genres = genres.join(", ");
    await folder.save();
  }
  res.send({ valid: true });
});

const mangaTypes = {
  Mg: "Manga",
  Mhw: "Manhwa",
  Web: "Webtoon",
};

routes.get("/changes-genres/:Id/:genre", async (req, res) => {
  const { Id, genre } = req.params;
  const folder = await db.folder.findOne({ where: { Id } });
  let genres = folder?.Genres.split(/,( |)/g);
  if (folder) {
    if (genre !== "sort") {
      if (!genres.includes("webtoon")) {
        genres = genres.filter((g) => g && !/manhwa|webtoon/i.test(g));
      } else {
        genres = genres.filter((g) => g && !/manga|manhwa|manhua/i.test(g));
      }

      genres.push(mangaTypes[genre]);
    }

    genres.sort();
    folder.Genres = genres.filter((g) => g?.trim()).join(", ");
    await folder.save();
  }
  res.send({ valid: true });
});

routes.post("/folder-create", async (req, res) => {
  const found = await db.folder.findOne({ where: { Name: req.body.Name, FilesType: req.body.FilesType } });
  if (found) {
    return res.send({ error: `Error: ${req.body.Name} already Exist.` });
  }
  try {
    const dir = await db.directory.findOne({ where: { Id: req.body.DirectoryId } });
    const file = {
      Status: 0,
      ...req.body,
      CreatedAt: new Date(),
      Path: path.join(dir.FullPath, req.body.Name),
      Type: "Folder",
    };

    const folder = await db.folder.create(file);
    const exist = fs.existsSync(folder.Path);
    return res.send({ valid: true, Id: folder.Id, exist });
  } catch (error) {
    console.log(error);
    return res.send({ error: "Error Creating Folder" });
  }
});

routes.get("/file-info/:folderId?", async (req, res) => {
  const folder = await db.folder.findOne({ where: { Id: req.params.folderId } });

  let files = [];

  if (fs.existsSync(folder.Path)) {
    files = fs
      .readdirSync(folder.Path.replace("homedir", homedir()))
      .filter((f) => !/\.(webp|jpg|png|gif|jpeg)/.test(f));
  }

  return res.send({
    Last: files.length > 0 ? files[files.length - 1] : "N/A",
    Total: files.length > 0 ? files.length : 0,
  });
});

routes.get("/folder/:folderId?", async (req, res) => {
  const folder = await db.folder.findOne({
    attributes: {
      include: [[literal(`(Select SUM(Size) from Files where FolderId = Folders.Id)`), "Size"]],
    },
    where: { Id: req.params.folderId || "" },
  });

  if (!folder) return res.send({});

  const dirs = await db.directory.findAll({ order: ["Name"] });

  const appConfig = await db.AppConfig.findOne();
  const imagePath = path.join(appConfig.ImagesPath, "Folder", folder.FilesType, folder.Name + ".jpg");
  let image = "";

  if (fs.existsSync(imagePath)) {
    image = fs.readFileSync(imagePath).toString("base64");
  }

  res.send({
    Name: folder.Name,
    Description: folder.Description,
    Genres: folder.Genres,
    AltName: folder.AltName,
    IsAdult: folder.IsAdult,
    DirectoryId: folder.DirectoryId,
    Author: folder.Author,
    Status: folder.Status,
    Server: folder.Server,
    EmissionDate: folder.EmissionDate,
    Size: folder.dataValues.Size || 0,
    FileCount: folder.FileCount,
    image,
    dirs,
    tags: await getTags(),
  });
});

routes.post("/cover", async (req, res) => {
  const { files, body } = req;

  if (body.folderId && files.image) {
    const folder = await db.folder.findOne({ where: { Id: body.folderId } });
    try {
      if (folder) {
        const posterPath = path.join(folder.Path, "Cover.jpg");

        createDir(folder.Path);

        const img = Sharp(Buffer.from(files?.image.data));
        await img.jpeg().toFile(posterPath);

        let Cover = path.join(defaultConfig.ImagesDir, "Folder", folder.FilesType, folder.Name + ".jpg");

        createDir(path.join(defaultConfig.ImagesDir, "Folder", folder.FilesType));

        await img.toFormat("jpg").resize({ width: 340 }).toFile(Cover);
      }
      res.send({ valid: true });
    } catch (error) {
      res.send({ msg: "Unsupported Image", error });

      console.log(error);
    }
  }
});

routes.get("/files/:folderId/:page/:items/:filter?", getData);

routes.get("/:dirId/:page/:items/:filter?", getData);

export default routes;
