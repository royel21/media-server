const Router = require("express").Router();

const db = require("../models");
const { getFilesList, getFolders } = require("./query-helper");

Router.get("/folders/:order/:page?/:items?/:search?", getFolders);

Router.get("/folder-content/:id/:order/:page?/:items?/:search?", (req, res) => {
    getFilesList(req.user, res, null, req.params, db.folder);
});

Router.get("/recents", (req, res) => {
    (async () => {
        let folders = await req.user.Recent.getFolders({
            limit: 50,
            order: [[db.sqlze.literal("RecentFolders.LastRead"), "DESC"]],
        });
        let result = folders.map((f) => {
            return {
                ...f.RecentFolders.dataValues,
                ...f.dataValues,
                RecentFolders: "",
            };
        });
        res.send(result);
    })();
});

Router.get("/dirs/:type", (req, res) => {
    const { type } = req.params;
    console.log(type);
    db.directory.findAll().then((dirs) => {
        return res.send(dirs);
    });
});

Router.get("/:filetype/:dirid/:order/:page?/:items?/:search?", getFolders);

module.exports = Router;
