import { Router } from "express";
import fs from "fs-extra";
import db from "../../models/index.js";

import { Op } from "sequelize";
import { getFilter } from "../utils.js";
import { getWatchedDirs, getWatchFiles, removeWatchedDir, removeWatchedFile, renameWatchedFile } from "./Watcher.js";

const routes = Router();

routes.get("/get-watched-dirs", getWatchedDirs);
routes.get("/remove-watched-dir/:Id", removeWatchedDir);

routes.post("/rename-watched-file", renameWatchedFile);
routes.get("/remove-watched-file/:Id", removeWatchedFile);
routes.get("/get-watched-files/:page/:items/:filter?", getWatchFiles);

const isValidFile = (Path, size = true) => {
  if (!fs.existsSync(Path)) {
    return "File not found";
  }

  if (size && fs.statSync(Path).size > 1024 * 1024) {
    return "File is too big";
  }
};

routes.get("/text-file/:Path", (req, res) => {
  const { Path } = req.params;
  let error = isValidFile(Path);
  if (error) return res.send({ error });

  const Text = fs.readFileSync(Path, "utf8");
  return res.send({ Text });
});

routes.post("/save-text", (req, res) => {
  const { Path, Text } = req.body;

  let error = isValidFile(Path);
  if (error) return res.send({ error });

  fs.writeFileSync(Path, Text);

  return res.send({ valid: true });
});

routes.get("/image/:Path", (req, res) => {
  const { Path } = req.params;
  let error = isValidFile(Path, false);
  if (error) return res.send({ error });

  const type = Path.split(".").pop();

  return res.sendFile(Path, { headers: { "Content-Type": `image/${type}` } });
});

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
