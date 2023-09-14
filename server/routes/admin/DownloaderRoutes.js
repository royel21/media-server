import { Router } from "express";
import db from "../../websocket/Models/index.js";
import { Op, literal } from "sequelize";

const routes = Router();

routes.get("/exclude-link/:Id", async ({ params }, res) => {
  const { Id } = params;
  const link = await db.Link.findOne({ where: { Id } });

  if (link) {
    link.update({ Exclude: !link.Exclude });
    return res.send({ valid: true });
  }

  res.send({ valid: false });
});

routes.get("/remove-link/:Id", async ({ params }, res) => {
  const { Id } = params;
  const link = await db.Link.findOne({ where: { Id } });

  if (link) {
    // link.destroy();
    return res.send({ valid: true });
  }
  res.send({ valid: false });
});

routes.get("/links/:items/:page?/:filter?", async ({ params }, res) => {
  const { page = 1, items, filter = "" } = params;
  let limit = +items || 10;
  let offset = (page - 1) * limit || 0;

  const qfilter = { [Op.like]: `%${filter}%` };
  const order = "Date";

  const datas = await db.Link.findAndCountAll({
    where: { [Op.or]: { Name: qfilter, AltName: qfilter, "$Server.Name$": qfilter } },
    limit,
    offset,
    include: { model: db.Server, Attributes: ["Id", "Name"] },
    order: [
      [literal(`Links.Date IS NULL`), order === "Name" ? "ASC" : "DESC"],
      [order, "DESC"],
      ["LastChapter", "DESC"],
    ],
  });

  res.send({
    totalItems: datas.count,
    totalPages: Math.ceil(datas.count / limit),
    links: datas.rows.map((lnk) => {
      delete lnk.dataValues.Server;
      return lnk.dataValues;
    }),
  });
});

routes.get("/servers", async (req, res)=>{
  const servers = await db.Server.findAll({order: ["Name"]});
  const datas = {};

  servers.forEach(srv=> {
    datas[srv.Id] = srv;
  })
  res.send(datas)
});

routes.post("/item-update", async ({ body }, res) => {
  const result = {};
  try {
     await db[body.table].update(body, {where: {Id: body.Id}});
     result.valid = true;
  } catch (error) {
    result.valid = false;
  }

  res.send(result);
})

export default routes;
