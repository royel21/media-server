import { Router } from "express";
import db from "../../models/index.js";
import { getFilter } from "../utils.js";
import fs from "fs-extra";
import path from "node:path";

const routes = Router();

const getData = async ({ params, url }, res) => {
  const { page, items, filter, folderId, dirId } = params;
  let filterTerm = decodeURIComponent(filter || "");

  // calculate the start and end of the query check sql limit
  let limit = +items || 10;
  let offset = (page - 1) * limit || 0;

  const query = {
    attributes: ["Id", "Name", "Type"],
    order: [db.sqlze.literal(`REPLACE(REPLACE(Name, "-", "0"), '[','0')`)], // used for natural ordering
    where: {},
    offset,
    limit,
  };

  let result;
  let filters = getFilter(filterTerm);

  // if contain folderId this is a file query we will need the folderId
  if (folderId) {
    query.where.FolderId = folderId;
    query.where.Name = filters;
    result = await db.file.findAndCountAll(query);
  } else {
    if (dirId && dirId !== "all") {
      query.where.DirectoryId = dirId;
    }
    query.attributes = [...query.attributes, "Path", "Status", "FilesType", "Scanning"];

    query.where[db.Op.or] = { Path: filters, AltName: filters };
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

routes.get("/dirs", async (req, res) => {
  const dirs = await db.directory.findAll({});
  res.send([...dirs.map((d) => d.dataValues)]);
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
  mhu: "Manhua",
  mhw: "Manhwa",
  web: "Webtoon",
};

routes.get("/changes-genres/:Id/:genre", async (req, res) => {
  const { Id, genre } = req.params;
  const folder = await db.folder.findOne({ where: { Id } });
  let genres = folder?.Genres.split(", ");

  if (folder) {
    if (genre !== "sort" && !genres?.includes("Raw")) {
      genres = genres.filter((g) => !/manga|manhwa|manhua|webtoon/i.test(g));
      genres.push(mangaTypes[genre]);
    }

    genres.sort();
    folder.Genres = genres.join(", ");
    await folder.save();
  }
  res.send({ valid: true });
});

routes.post("/folder-create", async (req, res) => {
  try {
    const dir = await db.directory.findOne({ where: { Id: req.body.DirectoryId } });
    const file = {
      ...req.body,
      CreatedAt: new Date(),
      Path: path.join(dir.FullPath, req.body.Name),
      Status: 0,
      Type: "Folder",
    };

    const folder = await db.folder.create(file);
    const exist = fs.existsSync(folder.Path);
    return res.send({ valid: true, Id: exist ? folder.Id : "" });
  } catch (error) {
    console.log(error);
    return res.send({ error: "Error Creating Folder" });
  }
});

routes.get("/folder/:folderId?", async (req, res) => {
  const folder = await db.folder.findOne({ where: { Id: req.params.folderId || "" } });
  const dirs = await db.directory.findAll({ order: ["Name"] });
  res.send({
    Description: folder?.Description,
    Genres: folder?.Genres,
    AltName: folder?.AltName,
    IsAdult: folder?.IsAdult,
    DirectoryId: folder?.DirectoryId,
    dirs,
  });
});

routes.get("/files/:folderId/:page/:items/:filter?", getData);

routes.get("/:dirId/:page/:items/:filter?", getData);

export default routes;
