import { Router } from "express";
import { Op, literal } from "sequelize";
import { formatLink } from "../utils.js";
import RenameRoutes from "./RenameRoutes.js";
import ExcludeChapRoutes from "./ExcludeChapRoutes.js";
import EventLogsRoutes from "./EventLogsRoutes.js";
import ServersRoutes from "./ServersRoutes.js";
import db from "../../models/index.js";

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
    link.destroy();
    return res.send({ valid: true });
  }
  res.send({ valid: false });
});

const getServers = async () => {
  const servers = await db.Server.findAll({ order: ["Name"], where: { Enable: true } });
  const datas = {};

  servers.forEach((srv) => {
    datas[srv.Id] = srv;
  });
  return datas;
};

routes.post("/links", async ({ body }, res) => {
  const { page = 1, items, filter = "", IsDownloading, first } = body;
  let limit = +items || 10;
  let offset = (page - 1) * limit || 0;

  const qfilter = { [Op.like]: `%${filter}%` };
  const order = "Date";

  const query = {
    where: { [Op.or]: { Name: qfilter, AltName: qfilter, "$Server.Name$": qfilter, Url: qfilter } },
    limit,
    offset,
    include: { model: db.Server, Attributes: ["Id", "Name"], required: true, where: { Enable: true } },
    order: [
      [literal(`Links.LastChapter = ""`), "DESC"],
      [literal(`Links.Date = null`), "DESC"],
      [order, "DESC"],
      ["Name", "ASC"],
    ],
  };

  let downloadList;
  if (IsDownloading) {
    query.where.IsDownloading = 1;
  }

  const datas = await db.Link.findAndCountAll(query);
  let servers;

  if (first) {
    servers = await getServers();
  }
  res.send({
    servers,
    downloadList,
    totalItems: datas.count,
    totalPages: Math.ceil(datas.count / limit),
    links: datas.rows.map((lnk) => {
      const serv = lnk.dataValues.Server;
      return { ...lnk.dataValues, Server: { Id: serv.Id, Name: serv.Name } };
    }),
  });
});

routes.post("/item-update", async ({ body }, res) => {
  const result = {};
  try {
    await db[body.table].update(body, { where: { Id: body.Id } });
    result.valid = true;
  } catch (error) {
    result.valid = false;
  }

  res.send(result);
});

const validRegex =
  /\/\/(aquamanga.com|bato.to)|\/(manga|manga-hentai|hentai|manhua|comic|manhwa(-raw|)|webtoon|bato|\/series\/\d+\/)\//;

routes.post("/add-link", async ({ body }, res) => {
  const { IsAdult, Url, Name, AltName, Raw } = body;
  const result = { valid: false };
  if (validRegex.test(Url) || !/=/.test(Url)) {
    const { url, serverName } = formatLink(body.Url);

    let [server] = await db.Server.findOrCreate({ where: { Name: serverName } });

    let adult = IsAdult !== undefined ? IsAdult : server.Type === "Adult";
    console.log(IsAdult, adult, Url, Name, Raw);

    try {
      await db.Link.create({
        Url: url,
        ServerId: server.Id,
        Name,
        AltName,
        IsAdult: adult,
        Date: new Date(),
        Raw,
      });
      result.valid = true;
    } catch (error) {
      if (error.toString().includes("SequelizeUniqueConstraintError")) {
        result.error = `Can't Add Duplicate Link`;
      }
      console.log(error.toString());
    }
  }

  res.send(result);
});

const getDownloads = async (DownloadingListId) => {
  try {
    return await db.Downloading.findAll({
      where: { DownloadingListId },
      attributes: {
        include: [
          [literal("(Select Name from Links where LinkId=Id)"), "Name"],
          [literal("(Select Url from Links where LinkId=Id)"), "Url"],
        ],
      },
    });
  } catch (error) {
    return [];
  }
};

routes.post("/remove-dlist", async ({ body }, res) => {
  const result = await db.DownloadingList.destroy({ where: { Id: body.Id } });
  res.send({ valid: result });
});

routes.post("/remove-dlink", async ({ body }, res) => {
  const result = await db.Downloading.destroy({ where: { Id: body.Id } });
  res.send({ valid: result });
});

routes.get("/download-list", async (_, res) => {
  const datas = { downloads: {}, DownloadingList: [] };

  datas.DownloadingList = await db.DownloadingList.findAll({ order: ["Name"] });

  if (datas.DownloadingList.length) {
    datas.downloads = await getDownloads(datas.DownloadingList[0].Id);
  }

  return res.send(datas);
});

routes.get("/downloads/:Id", async ({ params }, res) => {
  if (params.Id) {
    return res.send(await getDownloads(params.Id));
  }
  res.send([]);
});

routes.post("/save-downloads", async ({ body: { Name } }, res) => {
  try {
    const links = await db.Link.findAll({ where: { IsDownloading: true } });

    const [dl] = await db.DownloadingList.findOrCreate({ where: { Name } });

    if (dl) {
      await db.Downloading.destroy({ where: { DownloadingListId: dl.Id } });
      await db.Downloading.bulkCreate(links.map((lnk) => ({ LinkId: lnk.Id, DownloadingListId: dl.Id })));
    }

    res.send({
      list: dl,
      downloads: await getDownloads(dl.Id),
    });
  } catch (error) {
    console.log(error);
    res.send({ error: `Name: ${body.Name} is in use` });
  }
});

routes.post("/update-dlist-name", async ({ body: { Id, Name } }, res) => {
  try {
    await db.DownloadingList.update({ Name }, { where: { Id } });
    res.send({});
  } catch (error) {
    res.send({ error: `Name: ${Name} in use` });
  }
});

routes.get("/events/:page?", EventLogsRoutes.allEvents);
routes.get("/clear-events", EventLogsRoutes.clearEvents);

routes.get("/rename-list", RenameRoutes.renameList);
routes.post("/add-altname", RenameRoutes.addAltname);
routes.get("/remove-altname/:Id", RenameRoutes.removeAltname);

routes.get("/exclude-list/:LinkName", ExcludeChapRoutes.excludeChapList);
routes.post("/add-exclude", ExcludeChapRoutes.addExcludeChap);
routes.get("/remove-exclude/:Id", ExcludeChapRoutes.removeExcludeChap);

routes.get("/servers-list/change/:Id", ServersRoutes.changeState);
routes.get("/servers-list/delete/:Id", ServersRoutes.removeServer);
routes.get("/servers-list/", ServersRoutes.getServers);

export default routes;
