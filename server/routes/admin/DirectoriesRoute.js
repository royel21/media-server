import { Router } from "express";
import db from "../../models/index.js";

import fs from "fs-extra";
import path from "path";
import { ListFiles } from "win-explorer";
import { literal } from "sequelize";

const getNewId = () => {
  return Math.random().toString(36).slice(-5);
};

const routes = Router();

const { BACKUPDIR } = process.env;

routes.post("/remove", (req, res) => {
  let { Id } = req.body;
  db.directory
    .destroy({ where: { Id } })
    .then((result) => {
      if (result > 0) {
        res.send({ removed: true });
      } else {
        res.send({ removed: false, msg: "Can't find folder by Id" });
      }
    })
    .catch((err) => {
      console.log(err);
      res.send({ removed: false, msg: "Server error 500" });
    });
});

routes.post("/content", (req, res) => {
  let { Id, Path } = req.body;
  if (fs.existsSync(Path)) {
    let dirs = ListFiles(Path, { directory: true, hidden: true });
    let tdata = [];
    for (let d of dirs) {
      tdata.push({
        Id: getNewId(),
        Name: d.Name,
        Path: path.join(Path, d.Name),
        Content: [],
      });
    }
    res.send({ data: tdata, Id });
  }
});

routes.post("/update", async (req, res) => {
  const { body } = req;
  const dir = await db.directory.findOne({ where: { Id: body.id } });
  let success = false;
  if (dir) {
    await dir.update(body);
    success = true;
  }
  res.send({ success });
});

routes.get("/backups", async (_, res) => {
  let backups = [];
  if (fs.existsSync(BACKUPDIR)) {
    backups = fs.readdirSync(BACKUPDIR);
  }

  res.send(backups);
});

routes.post("/rm-backup", async ({ body }, res) => {
  if (body.backup) {
    const backup = path.join(BACKUPDIR, body.backup);
    if (fs.existsSync(backup)) {
      fs.removeSync(backup);
    }
    res.send({ success: true });
  }
});

routes.get("/", async (req, res) => {
  const data = await db.directory.findAll({
    attributes: [
      "Id",
      "Name",
      "FullPath",
      "Type",
      "FirstInList",
      "IsAdult",
      "IsLoading",
      [literal("(Select COUNT(Folders.Id) from Folders where DirectoryId = Directory.Id)"), "FolderCount"],
      [literal("(Select SUM(FileCount) from Folders where DirectoryId = Directory.Id)"), "TotalFiles"],
    ],
    order: ["IsAdult", "FullPath"],
  });

  let dirs = data.map((d) => d.dataValues);
  res.send(dirs);
});

export default routes;
