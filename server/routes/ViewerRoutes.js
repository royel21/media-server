import { Router } from "express";
import db from "../models/index.js";

import fs from "fs";

import { qryCurrentPos } from "./query-helper.js";
import { literal } from "sequelize";

const routes = Router();

const getFiles = async ({ user, body }, res, type) => {
  let table = await db[type].findOne({
    order: [literal(`REPLACE(REPLACE(Files.Name, "-", "0"), "[","0") ASC`)],
    where: { Id: body.id },
    include: {
      model: db.file,
      attributes: ["Id", "Name", "Type", "Duration", "FolderId", qryCurrentPos(user, "Files")],
    },
  });

  const folder = await db.folder.findOne({ where: { Id: body.id }, attributes: ["Name"] });
  res.send({
    Name: folder.Name,
    files: table.Files.map((d) => ({ ...d.dataValues })),
  });
};

routes.post("/folder/", (req, res) => {
  getFiles(req, res, "folder");
});

routes.post("/favorites/", (req, res) => {
  getFiles(req, res, "favorite");
});

routes.get("/video/:id", async (req, res) => {
  const file = await db.file.findOne({
    attributes: ["Id", "Name", "Size"],
    where: { Id: req.params.id },
    include: { model: db.folder },
  });

  if (file && req.headers.range) {
    const range = req.headers.range;
    if (!range) {
      res.status(400).send("Requires Range header");
    }

    const videoSize = fs.statSync(file.Path).size;
    const CHUNK_SIZE = 10 ** 6;
    const start = Number(range.replace(/\D/g, ""));
    const end = Math.min(start + CHUNK_SIZE, videoSize - 1);
    const contentLength = end - start + 1;
    const headers = {
      "Content-Range": `bytes ${start}-${end}/${videoSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": contentLength,
      "Content-Type": "video/mp4",
    };
    res.writeHead(206, headers);
    const videoStream = fs.createReadStream(file.Path, { start, end });
    videoStream.pipe(res);
  } else {
    res.send("Error File Not Found");
  }
});

//export this Router to use in our index.js
export default routes;
