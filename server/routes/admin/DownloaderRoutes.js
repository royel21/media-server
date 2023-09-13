import { Router } from "express";
import db from "../../websocket/Models/index.js";
import { Op } from "sequelize";

const routes = Router();

routes.get("/exclude-link/:Id", async ({ params }, res) => {
  const { Id } = params;
  const link = await db.Link.findOne({where: {Id}});

  if(link){
    link.update({Exclude: !link.Exclude});
    return res.send({valid: true});
  }

  res.send({valid: false});
});

routes.get("/remove-link/:Id", async ({ params }, res) => {
  const { Id } = params;
  const link = await db.Link.findOne({where: {Id}});

  if(link){
    // link.destroy();
    return res.send({valid: true});
  }
  res.send({valid: false});
});


routes.get("/links/:items/:page?/:filter?", async ({ params }, res) => {
  const { page = 1, items, filter = "" } = params;
  let limit = +items || 10;
  let offset = (page - 1) * limit || 0;

  const datas = await db.Link.findAndCountAll({
    where: { Name: { [Op.like]: `%${filter}%` } },
    limit,
    offset,
    include: { model: db.Server },
    order: [["Date", "DESC"]]
  });

  console.log(page, items);
  res.send({
    totalItems: datas.count,
    totalPages: Math.ceil(datas.count / limit),
    links: datas.rows.map((lnk) => lnk.dataValues),
  });
});

export default routes;
