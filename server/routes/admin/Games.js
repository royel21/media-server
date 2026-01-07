import { Router } from "express";
import { db } from "../../GameModels/index.js";
import { Op } from "sequelize";

const routes = Router();

const getFilters = (splt, filter) => {
  return {
    [splt === "&" ? Op.and : Op.or]: filter.split(splt).map((s) => ({
      [Op.or]: {
        Codes: {
          [Op.like]: "%" + s.trim() + "%",
        },
        Name: {
          [Op.like]: "%" + s.trim() + "%",
        },
        Path: {
          [Op.like]: "%" + s.trim() + "%",
        },
        "$Info.AltName$": {
          [Op.like]: "%" + s.trim() + "%",
        },
        "$Info.Company$": {
          [Op.like]: "%" + s.trim() + "%",
        },
        "$Info.ReleaseDate$": {
          [Op.like]: "%" + s.trim() + "%",
        },
      },
    })),
  };
};

routes.get("/:page/:rows/:search?", async (req, res) => {
  const { page = 0, rows, search = "" } = req.params;

  const offset = (page - 1) * +rows;
  let filters = getFilters(search.includes("&") ? "&" : "|", search);

  let games = [];
  try {
    games = await db.Game.findAndCountAll({
      where: filters,
      order: [["Name", "ASC"]],
      offset,
      limit: rows,
      include: [
        {
          model: db.Info,
          required: false,
          on: {
            "$Games.Codes$": { [db.Op.eq]: db.sqlze.col("Info.Codes") },
          },
        },
      ],
    });
  } catch (error) {
    console.log(error);
  }

  return res.send({
    items: games.rows.map((g) => g.dataValues),
    totalItems: games.count,
    totalPages: Math.ceil(games.count / 200),
  });
});

export default routes;
