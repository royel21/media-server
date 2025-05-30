import { Router } from "express";
import db from "../../models/index.js";

import { getFilter } from "../utils.js";
import { Op } from "sequelize";
import { getWatchedDirs, getWatchFiles, removeWatchedDir, removeWatchedFile, renameWatchedFile } from "./Watcher.js";

const routes = Router();

routes.get("/get-watched-dirs", getWatchedDirs);
routes.get("/remove-watched-dir/:Id", removeWatchedDir);

routes.post("/rename-watched-file", renameWatchedFile);
routes.get("/remove-watched-file/:Id", removeWatchedFile);
routes.get("/get-watched-files/:page/:items/:filter?", getWatchFiles);

routes.get("/:page/:items/:filter?", async (req, res) => {
  const { page, items, filter } = req.params;

  const limit = +items || 12;

  const query = {
    order: [["Name"]],
    attributes: [
      "Id",
      "Name",
      "FolderId",
      [db.sqlze.literal("(Select Path from Folders where Id=`File`.`FolderId`)"), "Path"],
      [db.sqlze.literal("(Select Size from Files where Id=`File`.`Id`)"), "Size"],
    ],
    offset: ((+page || 1) - 1) * limit,
    limit,
    where: { FolderId: { [Op.not]: null } },
  };

  if (filter) {
    const FolderId = await db.folder.findAll({
      attributes: ["Id", "Path"],
      where: { Path: getFilter(filter) },
    });
    query.where[Op.or] = [{ Name: getFilter(filter) }, { FolderId: FolderId.map((fd) => fd.Id) }];
  }

  let files = await db.file.findAndCountAll(query);

  let data = {
    files: files.rows.map((f) => ({ ...f.dataValues, ...f })),
    totalPages: Math.ceil(files.count / limit),
    totalItems: files.count,
  };

  res.send(data);
});

export default routes;
