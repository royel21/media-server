const Router = require("express").Router();
const fs = require("fs-extra");
const path = require("path");

const db = require("../../models");

Router.get("/:page/:items/:filter?", (req, res) => {
  let { page, items, filter } = req.params;

  db.file
    .findAndCountAll({
      order: [db.sqlze.literal("REPLACE(File.Name, '[','0')")],
      attribute: ["Id", "Name", "FullPath", "ViewCount"],
      offset: ((page || 1) - 1) * items,
      limit: items || 12,
      where: {
        Name: {
          [db.Op.like]: "%" + (filter || "") + "%",
        },
      },
    })
    .then((files) => {
      let data = {
        files: [],
        totalPages: Math.ceil(files.count / items),
        totalFiles: files.count,
      };

      data.files = files.rows.map((f) => f.dataValues);

      res.send(data);
    })
    .catch((err) => {
      res.send({ msg: "Server Error 500" });
    });
});

module.exports = Router;
