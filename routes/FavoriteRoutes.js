const Router = require("express").Router();

const db = require("../models");
const { getOrderBy } = require("./query-helper");

const getFolders = async (req, res) => {
    const { id, order, page, items, search } = req.params;

    let result = await db.folder.findAndCountAll({
        where: {
            Name: {
                [db.Op.like]: `%${search || ""}%`,
            },
        },
        include: [
            {
                attributes: ["Id"],
                model: db.favorite,
                where: {
                    Id: id,
                },
            },
        ],
        order: getOrderBy(order, "Folders."),
        offset: (page - 1) * items,
        limit: parseInt(items),
    });

    return res.json({
        files: result.rows,
        totalFiles: result.count,
        totalPages: Math.ceil(result.count / items),
    });
};

Router.get("/:id/:order/:page/:items/:search?", (req, res) => {
    getFolders(req, res).catch((err) => {
        console.log(err);
        res.send({ fail: true, msg: "server error" });
    });
});

const saveEdit = async (req, res) => {
    let { Id = "", Name } = req.body;
    let fav = await db.favorite.findOne({ where: { Id } });
    if (!fav) {
        fav = await db.favorite.create({ Name, UserId: req.user.Id });
    } else {
        await fav.update({ Name });
    }

    res.json({ Id: fav.Id, Name });
};

Router.post("/add-edit", (req, res) => {
    if (!req.body.Name) return res.send(false);

    saveEdit(req, res)
        .then(() => {
            return null;
        })
        .catch((err) => {
            console.log(err);

            res.json({ created: false, msg: err.message });
        });
});

const removeFav = async (req, res) => {
    let { Id } = req.body;
    let favs = await req.user.getFavorites();
    let result = { removed: false, msg: `Can't Delete the last favorite` };
    if (favs.length > 1) {
        let fav = favs.find((f) => f.Id === Id);
        result = await req.user.removeFavorite(fav);
        result = { removed: result !== null };
    }

    res.send(result);
};

Router.delete("/remove", (req, res) => {
    removeFav(req, res)
        .then((result) => {
            return res.send(result);
        })
        .catch((err) => {
            console.log(err);
            res.send({ removed: true, msg: "Internal Server Error 500" });
        });
});

Router.post("/add-folder", (req, res) => {
    const { FavoriteId, FolderId } = req.body;
    console.log("addFolder:", req.body);
    db.favoriteFolder
        .create({ FolderId, FavoriteId })
        .then((result) => {
            return res.send({ success: result !== null });
        })
        .catch((err) => {
            console.log(err);
            return res.send({ success: false });
        });
});

const removeFolder = async (req, res) => {
    const { id, fid } = req.body;
    let result = await db.favoriteFolder.destroy({
        where: { FolderId: fid, FavoriteId: id },
    });

    res.send({ removed: result > 0 });
};

Router.post("/remove-folder", (req, res) => {
    removeFolder(req, res).catch((err) => {
        console.log(err);
        res.send({ removed: false, msg: "Internal Server Error 500" });
    });
});

module.exports = Router;
