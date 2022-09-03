const Router = require("express").Router();

const db = require("../../models");

Router.get("/:page/:items/:filter?", async (req, res) => {
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
    where: {
      Name: {
        [db.Op.like]: `%${filter || ""}%`,
      },
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

module.exports = Router;
