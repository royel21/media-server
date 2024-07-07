import { Router } from "express";
import db from "../../models/index.js";

import { getFilter } from "../utils.js";
import { Op } from "sequelize";

const routes = Router();

routes.get("/:page/:items/:filter?", async (req, res) => {
  const { page, items, filter } = req.params;

  const limit = +items || 12;
  const FolderId = await db.folder.findAll({ attributes: ["Id", "Path"], where: { Path: getFilter(filter) } });

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
      [Op.or]: [{ Name: getFilter(filter) }, { FolderId: FolderId.map((fd) => fd.Id) }],
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
