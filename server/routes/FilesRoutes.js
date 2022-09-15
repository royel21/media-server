const Router = require("express").Router();

const db = require("../models");
const { getFiles, getFolders } = require("./query-helper");
const { getFilter } = require("./utils");

const sortName = (a, b) => a.Name.localeCompare(b.Name);
const { literal } = db.sqlze;

Router.get("/folder-content/:id/:order/:page?/:items?/:search?", async (req, res) => {
  const { id, order, page, items, search } = req.params;

  let data = {};

  try {
    data = await getFiles(req.user, { id, order, page, items, search }, db.folder);
    const folder = await db.folder.findOne({
      attributes: {
        include: [[literal("(Select currentFile from RecentFolders where FolderId = `Folders`.`Id`)"), "currentFile"]],
      },
      where: { Id: id },
    });

    res.json({
      files: data.rows.map((d) => ({ ...d.dataValues, Cover: `/${d.Type}/${folder.Name}/${d.Name}.jpg` })),
      totalFiles: data.count,
      totalPages: Math.ceil(data.count / items),
      folder: { ...folder.dataValues, Cover: folder.Cover },
      valid: true,
    });
  } catch (err) {
    console.log(err);
    res.send({});
  }
});
Router.post("/recents/remove", async ({ body }, res) => {
  if (body.Id) {
    const recent = await db.recentFolder.findOne({ where: { FolderId: body.Id } });
    if (recent) await recent.destroy();
    return res.send({ valid: recent !== null });
  }
  return res.send({ valid: false, msg: "Invalid Id" });
});

Router.get("/recents/:items/:page?/:filter?", async (req, res) => {
  const { page, items, filter } = req.params;
  const p = +page || 1;
  const limit = +items || 16;

  const recents = await db.recentFolder.findAndCountAll({
    order: [["LastRead", "DESC"]],
    where: { RecentId: req.user.Recent.Id },
    include: {
      model: db.folder,
      attributes: ["Id", "Name", "FileCount", "Cover", "FilesType", "Type", "Status"],
      where: {
        Path: getFilter(filter),
      },
      required: true,
    },
    offset: (p - 1) * limit,
    limit,
  });
  //Map Folder
  const folders = recents.rows.map((rc) => {
    delete rc.dataValues.Folder;
    delete rc.dataValues.LastRead;
    return {
      ...rc.dataValues,
      ...rc.Folder.dataValues,
      Cover: rc.Folder.Cover,
    };
  });

  res.send({
    items: folders,
    page: p,
    totalFiles: recents.count,
    totalPages: Math.ceil(recents.count / limit),
    valid: true,
  });
});

Router.get("/dirs", async (req, res) => {
  const dirs = await db.directory.findAll({
    attributes: ["Id", "Name", "Type"],
    where: { IsAdult: { [db.Op.lte]: req.user.AdultPass } },
  });

  let Mangas = dirs.filter((d) => d.Type === "Mangas").sort(sortName);
  let Videos = dirs.filter((d) => d.Type === "Videos").sort(sortName);

  return res.send({
    Mangas,
    Videos,
    valid: true,
  });
});

Router.get("/file-data/:id", async (req, res) => {
  let file = await db.file.findOne({ where: { Id: req.params.id } });
  return res.send(file.dataValues);
});

Router.get("/reset-recents/:folderid", async ({ params }, res) => {
  const files = await db.file.findAll({ where: { FolderId: params.folderid } });
  await db.recentFile.update({ LastPos: 0 }, { where: { FileId: files.map((f) => f.Id) } });
  res.send("done");
});

Router.get("/first-last/:isfirst/:folderid", async (req, res) => {
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

Router.get("/folders/:order/:page?/:items?/:search?", getFolders);

Router.get("/:filetype/:dirid/:order/:page?/:items?/:search?", getFolders);

module.exports = Router;
