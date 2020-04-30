const Router = require("express").Router();
const db = require("../../models");
const fs = require("fs-extra");
const path = require("path");

const getCoverPath = (name) => {
  return path.join(process.cwd(), "images", "covers", "folder", name + ".jpg");
};

const getData = async (req, res) => {
  let { page, items, filter } = req.params;
  let offset = (page - 1) * items || 0;
  let limit = items || 10;
  let folders = await db.folder.findAndCountAll({
    order: ["Name"],
    offset,
    limit,
    where: {
      Name: { [db.Op.like]: `%${filter || ""}%` },
    },
  });

  let totalPages = Math.ceil(folders.count / items);
  res.send({
    folders: folders.rows,
    totalPages,
    totalItems: folders.count,
  });
};

Router.get("/:page/:items/:filter?", (req, res) => {
  getData(req, res).catch((err) => {
    console.log(err);
  });
});

Router.get("/files/:folderId/:page/:items/:filter?", (req, res) => {
  let { folderId, page, items, filter } = req.params;
  let offset = (page - 1) * items || 0;
  let limit = items || 10;
  db.file
    .findAndCountAll({
      order: [db.sqlze.literal(`REPLACE(Name, '[','0')`)],
      where: {
        [db.Op.and]: {
          FolderId: folderId,
          Name: { [db.Op.like]: `%${filter || ""}%` },
        },
      },
      offset,
      limit,
    })
    .then((result) => {
      res.send({
        files: result.rows,
        totalPages: Math.ceil(result.count / items),
        totalItems: result.count,
      });
    });
});

module.exports = Router;
