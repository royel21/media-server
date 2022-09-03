const Router = require("express").Router();
const db = require("../../models");

const getData = async ({ params }, res) => {
  const { page, items, filter, folderId } = params;

  // calculate the start and end of the query check sql limit
  let limit = +items || 10;
  let offset = (page - 1) * limit || 0;

  let table = folderId ? "File" : "Folders";

  const query = {
    attributes: ["Id", "Name", "Type"],
    order: [db.sqlze.literal(`CAST(${table}.Name as unsigned), REPLACE(${table}.Name, '[','0')`)], // used for natural ordering
    where: {
      [db.Op.and]: {
        Name: { [db.Op.like]: `%${filter || ""}%` },
      },
    },
    offset,
    limit,
  };

  let result;
  // if contain folderId this is a file query we will need the folderId
  if (folderId) {
    query.where.FolderId = folderId;
    result = await db.file.findAndCountAll(query);
  } else {
    query.attributes.push("Path"); // add Path to folder query
    result = await db.folder.findAndCountAll(query);
  }

  let totalPages = Math.ceil(result.count / query.limit);

  res.send({
    items: result.rows,
    totalPages,
    totalItems: result.count,
  });
};

Router.get("/:page/:items/:filter?", (req, res) => {
  getData(req, res).catch((err) => {
    console.log(err);
  });
});

Router.get("/files/:folderId/:page/:items/:filter?", (req, res) => {
  getData(req, res).catch((err) => {
    console.log(err);
  });
});

module.exports = Router;
