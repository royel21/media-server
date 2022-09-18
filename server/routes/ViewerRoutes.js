var express = require("express");
var Router = express.Router();
const fs = require("fs");
const path = require("path");
const db = require("../models");
const { qryCurrentPos } = require("./query-helper");

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
    files: table.Files.map((d) => ({ ...d.dataValues, Cover: `/${d.Type}/${folder.Name}/${d.Name}.jpg` })),
    config: UserConfig.dataValues.Config,
  });
};

Router.post("/folder/", (req, res) => {
  getFiles(req, res, "folder");
});

Router.post("/favorites/", (req, res) => {
  getFiles(req, res, "favorite");
});

Router.get("/video/:id", (req, res) => {
  db.file
    .findOne({
      attributes: ["Id", "Name", "Size"],
      where: { Id: req.params.id },
      include: { model: db.folder },
    })
    .then((file) => {
      if (file) {
        let filePath = path.join(file.Folder.Path, file.Name);
        var total = file.Size;
        var range = req.headers.range;
        if (!range) {
          // 416 Wrong range
          return res.sendStatus(416);
        }

        var positions = range.replace(/bytes=/, "").split("-");
        var start = parseInt(positions[0], 10);

        if (start === 0) {
          if (!fs.existsSync(filePath)) return res.sendStatus(404);
        }

        // same code as accepted answer
        var end = positions[1] ? parseInt(positions[1], 10) : total - 1;
        var chunksize = end - start + 1;
        // poor hack to send smaller chunks to the browser
        var maxChunk = 1024 * 1024; // 1MB at a time

        if (chunksize > maxChunk) {
          end = start + maxChunk - 1;
          chunksize = end - start + 1;
        }

        res.writeHead(206, {
          "Content-Range": "bytes " + start + "-" + end + "/" + total,
          "Accept-Ranges": "bytes",
          "Content-Length": chunksize,
          "Content-Type": "video/mp4",
        });

        var stream = fs
          .createReadStream(filePath, {
            start: start,
            end: end,
          })
          .on("open", function () {
            stream.pipe(res);
          })
          .on("error", function (err) {
            res.end(err);
          });
      } else {
        res.send("Error File Not Found");
      }
    });
});

//export this Router to use in our index.js
module.exports = Router;
