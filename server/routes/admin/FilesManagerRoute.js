import { Router } from "express";
import db from "../../models/index.js";

import { getFilter } from "../utils.js";
import { Op, where } from "sequelize";
import fs from "fs-extra";
import path from "node:path";

const routes = Router();

routes.get("/:page/:items/:filter?", async (req, res) => {
  const { page, items, filter } = req.params;

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
    where: { FolderId: { [Op.not]: null } },
  };

  if (filter) {
    const FolderId = await db.folder.findAll({ attributes: ["Id", "Path"], where: { Path: getFilter(filter) } });
    query.where[Op.or] = [{ Name: getFilter(filter) }, { FolderId: FolderId.map((fd) => fd.Id) }];
  }

  let files = await db.file.findAndCountAll(query);

  let data = {
    files: files.rows.map((f) => {
      let Size = 0;
      const file = path.join(f.dataValues.Path, f.Name);
      if (fs.existsSync(file)) {
        Size = fs.statSync(file).size;
      }
      return { ...f.dataValues, ...f, Size };
    }),
    totalPages: Math.ceil(files.count / limit),
    totalItems: files.count,
  };

  res.send(data);
});

export default routes;
