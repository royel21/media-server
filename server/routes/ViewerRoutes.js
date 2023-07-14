import { Router } from "express";
import db from "../models/index.js";

import { existsSync, createReadStream } from "fs";
import { join } from "path";

import { qryCurrentPos } from "./query-helper.js";

const routes = Router();

const getFiles = async ({ user, body }, res, type) => {
  const { Recent, UserConfig } = user;

  let table = await db[type].findOne({
    where: { Id: body.id },
    order: [db.sqlze.literal("REPLACE(`Files`.`Name`, '[','0')")],
    include: {
      model: db.file,
      attributes: ["Id", "Name", "Type", "Duration", "FolderId", "ViewCount", qryCurrentPos(Recent, "Files")],
    },
  });

  const folder = await db.folder.findOne({ where: { Id: body.id }, attributes: ["Name"] });
  res.send({
    Name: folder.Name,
    files: table.Files.map((d) => ({ ...d.dataValues })),
    config: UserConfig.dataValues.Config,
  });
};

routes.post("/folder/", (req, res) => {
  getFiles(req, res, "folder");
});

routes.post("/favorites/", (req, res) => {
  getFiles(req, res, "favorite");
});

routes.get("/video/:id", (req, res) => {
  db.file
    .findOne({
      attributes: ["Id", "Name", "Size"],
      where: { Id: req.params.id },
      include: { model: db.folder },
    })
    .then((file) => {
      if (file) {
        let filePath = join(file.Folder.Path, file.Name);
        const range = req.headers.range;
        if (!range) {
          return res.status(400).send("Requires Range header");
        }

        const chunkSize = 1024 * 256;
        const start = Number(range.replace(/\D/g, ""));
        const end = Math.min(start + chunkSize, file.Size - 1);
        const contentLength = end - start + 1;

        res.writeHead(206, {
          "Content-Range": `bytes ${start}-${end}/${file.Size}`,
          "Accept-Ranges": "bytes",
          "Content-Length": contentLength,
          "Content-Type": "video/mp4",
        });

        let stream = createReadStream(filePath, { start, end });
        stream.pipe(res);
      } else {
        res.send("Error File Not Found");
      }
    });
});

//export this Router to use in our index.js
export default routes;
