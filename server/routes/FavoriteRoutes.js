import { Router } from "express";
import db from "../models/index.js";

import { getOrderBy } from "./query-helper.js";

const routes = Router();

routes.post("/create-update", async (req, res) => {
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

routes.post("/remove", async (req, res) => {
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

routes.post("/add-folder", async (req, res) => {
  const { FavoriteId, FolderId } = req.body;

  try {
    const result = await db.favoriteFolder.create({ FolderId, FavoriteId });
    return res.send({ success: result !== null });
  } catch (error) {
    console.log(error);
    return res.send({ success: false });
  }
});

routes.post("/remove-folder", async (req, res) => {
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

routes.get("/:id/:order/:page/:items/:search?", async (req, res) => {
  try {
    const { id, order, page, items, search } = req.params;
    const limit = +items || 16;

    const query = {
      attributes: ["Id", "Name", "FileCount", "Type", "CreatedAt"],
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
          required: true,
        },
      ],
      order: getOrderBy(order, "Folders"),
      offset: (page - 1) * limit,
      limit,
    };

    let result = {
      rows: [],
      count: 0,
    };

    try {
      result = await db.folder.findAndCountAll(query);
    } catch (error) {
      console.error(error);
    }

    const files = result.rows.map((r) => {
      delete r.dataValues.Favorites;
      return { ...r.dataValues };
    });

    return res.json({
      files,
      totalFiles: result.count,
      totalPages: Math.ceil(result.count / limit),
      valid: true,
    });
  } catch (error) {
    console.log(error);
    res.send({ fail: true, msg: "server error" });
  }
});

export default routes;
