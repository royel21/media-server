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

Router.get("/dirs", (req, res) => {
    db.directory.findAll().then((dirs) => {
        return res.send(dirs);
    });
});


const resetRecents = async ({ folderid }) =>{
    const files = await db.file.findAll({where: { FolderId: folderid }});
    const result = await db.recentFile.update({LastPos: 0}, {where: {FileId: files.map(f=> f.Id)}});
    console.log("folder reseted", result)
}

Router.get("/reset-recents/:folderid", (req, res) => {
        resetRecents(req.params).then(()=>{
            res.send("done");
        });

});

Router.get("/first-last/:isfirst/:folderid", (req, res) => {
    db.file.findAll({order: ["Name"], where: {FolderId: req.params.folderid}, include:[{ model: db.folder }]}).then(files=>{
        if(req.params.isfirst === "first"){
            res.send(files[0]);
        }else{
        res.send(files[files.length-1]);
        }
    });
});

Router.get("/:filetype/:dirid/:order/:page?/:items?/:search?", getFolders);

module.exports = Router;
