import { Router } from "express";
import db from "../../models/index.js";

import { getFilter } from "../utils.js";

const routes = Router();

routes.get("/:page/:items/:filter?", async (req, res) => {
  const { page, items, filter } = req.params;
  let filterTerm = filter || "";

  const limit = +items || 12;

  const query = {
    order: ["Name"],
    attributes: [
      "Id",
      "Name",
      "FolderId",
      [db.sqlze.literal("(Select Path from Folders where Id=`File`.`FolderId`)"), "Path"],
    ],
    offset: ((+page || 1) - 1) * limit,
    limit,
    where: {
      Name: getFilter(filterTerm),
    },
  };

  let files = await db.file.findAndCountAll(query);

  let data = {
    files: files.rows.map((f) => f.dataValues),
    totalPages: Math.ceil(files.count / limit),
    totalItems: files.count,
  };

  res.send(data);
});

export default routes;
