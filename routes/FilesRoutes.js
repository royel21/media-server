const Router = require("express").Router();

const db = require("../models");
const { getFilesList, getFolders } = require("./query-helper");

Router.get("/folders/:order/:page?/:items?/:search?", getFolders);

Router.get("/folder-content/:id/:order/:page?/:items?/:search?", (req, res) => {
  getFilesList(req.user, res, null, req.params, db.folder);
});

Router.get("/:filetype/:order/:page?/:items?/:search?", getFolders);

module.exports = Router;
