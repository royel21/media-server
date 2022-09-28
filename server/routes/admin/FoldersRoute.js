import { Router } from "express";
import db from "../../models/index.js";
import { getFilter } from "../utils.js";

const routes = Router();

const getData = async ({ params }, res) => {
  const { page, items, filter, folderId } = params;
  let filterTerm = filter || "";

  // calculate the start and end of the query check sql limit
  let limit = +items || 10;
  let offset = (page - 1) * limit || 0;

  const query = {
    attributes: ["Id", "Name", "Type", "Cover"],
    order: [db.sqlze.literal(`REPLACE(Name, '[', '0'), CAST(Name AS UNSIGNED)`)], // used for natural ordering
    where: {},
    offset,
    limit,
  };

  let result;
  // if contain folderId this is a file query we will need the folderId
  if (folderId) {
    query.where.FolderId = folderId;
    query.where.Name = getFilter(filterTerm);
    result = await db.file.findAndCountAll(query);
  } else {
    query.attributes.push("Path"); // add Path to folder query
    query.attributes.push("Description"); // add Description to folder query
    query.attributes.push("Genres"); // add Genres to folder query
    query.attributes.push("Status"); // add Genres to folder query
    query.where.Path = getFilter(filterTerm);
    result = await db.folder.findAndCountAll(query);
    result.rows = result.rows.map((fd) => ({ ...fd.dataValues, Cover: encodeURI(fd.Cover) }));
  }

  let totalPages = Math.ceil(result.count / query.limit);

  res.send({
    items: result.rows,
    totalPages,
    totalItems: result.count,
  });
};

routes.get("/:page/:items/:filter?", (req, res) => {
  getData(req, res).catch((err) => {
    console.log(err);
  });
});

routes.get("/files/:folderId/:page/:items/:filter?", (req, res) => {
  getData(req, res).catch((err) => {
    console.log(err);
  });
});

export default routes;
