const Router = require("express").Router();

const db = require("../models");
const { getOrderBy } = require("./query-helper");

Router.post("/create-update", async (req, res) => {
  if (!req.body.Name) return res.send(false);

  try {
    let { Id = "", Name } = req.body;
    let fav = await db.favorite.findOne({ where: { Id } });

    if (!fav) {
      fav = await db.favorite.create({ Name, UserId: req.user.Id });
    } else {
      await fav.update({ Name });
    }

    res.json({ Id: fav.Id, Name });
  } catch (error) {
    console.log(error);
    res.json({ created: false, msg: err.message });
  }
});

Router.delete("/remove", async (req, res) => {
  try {
    let { Id } = req.body;
    let favs = await req.user.getFavorites();
    let result = { removed: false, msg: `Can't Delete the last favorite` };

    if (favs.length > 1) {
      let fav = favs.find((f) => f.Id === Id);
      result = await req.user.removeFavorite(fav);
      result = { removed: result !== null };
    }

    res.send(result);
  } catch (error) {
    console.log(error);
    res.send({ removed: true, msg: "Internal Server Error 500" });
  }
});

Router.post("/add-folder", async (req, res) => {
  const { FavoriteId, FolderId } = req.body;

  try {
    const result = await db.favoriteFolder.create({ FolderId, FavoriteId });
    return res.send({ success: result !== null });
  } catch (error) {
    console.log(error);
    return res.send({ success: false });
  }
});

Router.post("/remove-folder", async (req, res) => {
  try {
    const { id, fid } = req.body;
    let result = await db.favoriteFolder.destroy({
      where: { FolderId: fid, FavoriteId: id },
    });

    res.send({ removed: result > 0 });
  } catch (error) {
    console.log(error);
    res.send({ removed: false, msg: "Internal Server Error 500" });
  }
});

Router.get("/:id/:order/:page/:items/:search?", async (req, res) => {
  try {
    const { id, order, page, items, search } = req.params;
    const limit = +items || 16;

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
      order: getOrderBy(order, "Folders"),
      offset: (page - 1) * limit,
      limit,
    });

    return res.json({
      files: result.rows,
      totalFiles: result.count,
      totalPages: Math.ceil(result.count / limit),
    });
  } catch (error) {
    console.log(err);
    res.send({ fail: true, msg: "server error" });
  }
});

module.exports = Router;
