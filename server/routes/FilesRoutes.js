import { Router } from "express";
import db from "../models/index.js";

import { getFiles, getFolders } from "./query-helper.js";

import { clamp, getFilter } from "./utils.js";
import { Op, literal } from "sequelize";

const routes = Router();

routes.get("/folder-content/:id/:order/:page?/:items?/:search?", async (req, res) => {
  getFiles(req.user, req.params).then((data) => res.send(data));
});

routes.post("/recents/remove", async ({ body }, res) => {
  if (body.Id) {
    const recent = await db.recentFolder.findOne({ where: { FolderId: body.Id } });
    if (recent) await recent.destroy();
    return res.send({ valid: recent !== null });
  }
  return res.send({ valid: false, msg: "Invalid Id" });
});

routes.post("/file-update", async ({ body, user }, res) => {
  try {
    let recent = await db.recentFile.findOrCreate({
      where: { FileId: body.Id, UserId: user.Id },
    });
    await recent[0].update({ LastPos: body.CurrentPos || 0 });
  } catch (error) {
    console.log(error);
  }
  res.send({ valid: true });
});

routes.get("/recents/:items/:page?/:filter?", async (req, res) => {
  const { page, items, filter } = req.params;
  let p = +page || 1;
  const limit = +items || 16;
  let offset = (p - 1) * limit;
  if (offset < 0) {
    offset = 0;
  }

  const filters = getFilter(filter);

  const query = {
    order: [["LastRead", "DESC"]],
    where: { UserId: req.user.Id },
    include: {
      model: db.folder,
      attributes: [
        "Id",
        "Name",
        "FileCount",
        "FilesType",
        "Type",
        "Status",
        "Genres",
        "Author",
        "EmissionDate",
        "CreatedAt",
      ],
      where: {
        [Op.or]: { Name: filters, AltName: filters, Genres: filters, Author: filters },
        IsAdult: { [Op.lte]: req.user.AdultPass },
      },
      required: true,
    },
  };

  const count = await req.user.countRecentFolders(query);

  const totalPages = Math.ceil(count / limit);

  p = clamp(p, 1, totalPages);

  query.include.attributes.push(
    [
      literal(
        `(Select Name from Files where FolderId=RecentFolders.FolderId ORDER BY REPLACE(REPLACE(Files.Name, "-", "0"), "[","0") DESC LIMIT 1)`
      ),
      "LastFile",
    ],
    [literal(`(Select SUM(Size) from Files where FolderId = RecentFolders.FolderId)`), "Size"]
  );

  const recents = await req.user.getRecentFolders({
    ...query,
    offset,
    limit,
  });
  //Map Folder
  const folders = recents.map((rc) => {
    const isRaw = rc.Folder.dataValues.Genres.includes("Raw");
    delete rc.dataValues.Folder;
    delete rc.dataValues.LastRead;
    delete rc.Folder.dataValues.Genres;
    return {
      ...rc.dataValues,
      ...rc.Folder.dataValues,
      isRaw,
    };
  });

  res.send({
    items: folders,
    page: p,
    totalFiles: count,
    totalPages,
    valid: true,
  });
});

routes.get("/dirs", async (req, res) => {
  const dirs = await db.directory.findAll({
    order: ["FirstInList"],
    attributes: ["Id", "Name", "Type", "FirstInList", "IsAdult"],
    where: { IsAdult: { [Op.lte]: req.user.AdultPass } },
  });

  let Mangas = [...dirs.filter((d) => d.Type === "Mangas")];
  let Videos = [...dirs.filter((d) => d.Type === "Videos")];

  return res.send({
    Mangas,
    Videos,
    valid: true,
  });
});

routes.get("/file-data/:id", async (req, res) => {
  let file = await db.file.findOne({ where: { Id: req.params.id } });
  return res.send(file.dataValues);
});

routes.get("/first-last/:isfirst/:folderid", async (req, res) => {
  let files = await db.file.findAll({
    order: ["Name"],
    where: { FolderId: req.params.folderid },
    include: [{ model: db.folder }],
  });

  if (req.params.isfirst === "first") {
    res.send(files[0]);
  } else {
    res.send(files[files.length - 1]);
  }
});

routes.get("/folders/:order/:page?/:items?/:search?", getFolders);

routes.post("/folder/update", async ({ body, user }, res) => {
  if (user.Role.includes("Manager") && body.Id) {
    const { Id, ...data } = body;
    const folder = await db.folder.findOne({ where: { Id } });
    if (folder) {
      await folder.update(data);
      return res.send({ valid: true });
    } else {
      return res.send({ valid: false });
    }
  }

  return res.send({ valid: false, errors: ["Not Authorized"] });
});

routes.get("/:filetype/:dirid/:order/:page?/:items?/:search?", getFolders);

export default routes;
