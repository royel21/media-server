const Router = require("express").Router();

const db = require("../models");
const { getFiles, getFolders } = require("./query-helper");

Router.get("/folder-content/:id/:order/:page?/:items?/:search?", async (req, res) => {
  const { id, order, page, items, search } = req.params;

  let data = {};
  let folder;

  try {
    data = await getFiles(req.user, { id, order, page, items, search }, db.folder);
    folder = await db.recentFolder.findOne({ where: { FolderId: id } });

    res.json({
      files: data.rows,
      totalFiles: data.count,
      totalPages: Math.ceil(data.count / items),
      currentFile: folder?.CurrentFile,
      name: folder?.Name,
    });
  } catch (err) {
    console.log(err);
    res.send({});
  }
});

Router.get("/recents", async (req, res) => {
  let folders = await req.user.Recent.getFolders({
    limit: 50,
    order: [[db.sqlze.literal("RecentFolders.LastRead"), "DESC"]],
  });

  let result = folders.map((f) => ({
    ...f.RecentFolders.dataValues,
    ...f.dataValues,
    RecentFolders: "",
  }));

  res.send(result);
});

Router.get("/dirs", async (req, res) => {
  const dirs = await db.directory.findAll({ where: { IsAdult: { [db.Op.lte]: req.user.AdultPass } } });
  return res.send(dirs);
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
