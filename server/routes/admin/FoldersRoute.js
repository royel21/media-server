import { Router } from "express";
import db from "../../models/index.js";
import { getFilter } from "../utils.js";
import fs from "fs-extra";
import path from "node:path";

const routes = Router();

const getData = async ({ params }, res) => {
  const { page, items, filter, folderId } = params;
  let filterTerm = decodeURIComponent(filter || "");

  // calculate the start and end of the query check sql limit
  let limit = +items || 10;
  let offset = (page - 1) * limit || 0;

  const query = {
    attributes: ["Id", "Name", "Type"],
    order: [db.sqlze.literal(`REPLACE(Name, '[', '-'), CAST(Name AS UNSIGNED)`)], // used for natural ordering
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
    query.attributes.push("Path"); // add Path to folder query
    query.attributes.push("Status"); // add Genres to folder query
    query.where[db.Op.or] = { Path: filters, AltName: filters };
    result = await db.folder.findAndCountAll(query);

    result.rows = result.rows.map((fd) => {
      delete fd.dataValues.Name;
      return { ...fd.dataValues };
    });
  }

  const dir = await db.directory.findOne({ where: { Id: result[0]?.DirectoryId || "" } });

  let totalPages = Math.ceil(result.count / query.limit);

  res.send({
    items: result.rows,
    totalPages,
    totalItems: result.count,
  });
};

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

routes.get("/files/:folderId/:page/:items/:filter?", (req, res) => {
  getData(req, res).catch((err) => {
    console.log(err);
  });
});

routes.get("/:page/:items/:filter?", (req, res) => {
  getData(req, res).catch((err) => {
    console.log(err);
  });
});

export default routes;
