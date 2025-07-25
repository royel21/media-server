import { Router } from "express";
import { Op, literal } from "sequelize";
import { formatLink, getFilter } from "../utils.js";
import RenameRoutes from "./RenameRoutes.js";
import ExcludeChapRoutes from "./ExcludeChapRoutes.js";
import EventLogsRoutes from "./EventLogsRoutes.js";
import ServersRoutes from "./ServersRoutes.js";
import db from "#server/models/index";
import { cleanText } from "#server/utils";

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
    await link.destroy();
    if (!(await db.Link.findOne({ where: { Name: link.Name } }))) {
      await db.Exclude.destroy({ where: { Name: link.Name } });
    }

    if (!(await db.Link.findOne({ where: { Name: link.Name } }))) {
      await db.NameList.destroy({ where: { AltName: link.Name } });
    }
    return res.send({ valid: true });
  }
  res.send({ valid: false });
});

routes.post("/links", async ({ body }, res) => {
  const { page = 1, items, filter = "", IsDownloading, first, ServerId } = body;
  let limit = +items || 10;
  let offset = (page - 1) * limit || 0;

  const query = {
    where: {},
    limit,
    offset,
    include: { model: db.Server, Attributes: ["Id", "Name"], required: true },
    order: [
      [literal(`Links.LastChapter = ""`), "DESC"],
      ["DATE", "DESC"],
      [literal(`Links.LastChapter`), "DESC"],
      ["Name", "DESC"],
    ],
  };

  if (filter) {
    const appConfig = await db.AppConfig.findOne();
    const qfilter = getFilter(cleanText(filter, appConfig));
    query.where = { [Op.or]: { Name: qfilter, AltName: qfilter, "$Server.Name$": qfilter, Url: qfilter } };
  }

  if (IsDownloading) {
    query.where.IsDownloading = 1;
    query.order = [
      ["Name", "DESC"],
      [literal(`Links.LastChapter = ""`), "DESC"],
    ];
  }

  let servers;

  if (first && ServerId) {
    servers = await db.Server.findAll({ order: ["Name"] });
    const srv = servers.find((sv) => sv.Id === +ServerId) || servers[0];
    query.where.ServerId = srv.Id;
  }

  if (ServerId && !query.where.ServerId) query.where.ServerId = +ServerId;

  if (!ServerId && !IsDownloading) {
    query.include.where = { Enable: true };
    query.where.Exclude = false;
  }

  const datas = await db.Link.findAndCountAll(query);

  res.send({
    servers,
    totalItems: datas.count,
    totalPages: Math.ceil(datas.count / limit),
    links: datas.rows.map((lnk) => {
      const serv = lnk.dataValues.Server;
      return { ...lnk.dataValues, Server: { Id: serv?.Id, Name: serv?.Name } };
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

const createLink = async (Url, body, result) => {
  const { IsAdult, Name, AltName, Raw } = body;
  if (validRegex.test(Url) || !/=/.test(Url)) {
    const { url, serverName } = formatLink(Url);

    let [server, isNew] = await db.Server.findOrCreate({ where: { Name: serverName } });
    let adult = IsAdult !== undefined ? IsAdult : server.Type === "Adult";

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
      result.ServerId = server.Id;
      result.server = isNew ? server.dataValues : null;
    } catch (error) {
      if (error.toString().includes("SequelizeUniqueConstraintError")) {
        if (!result.error.includes("Can't Add Duplicate Link")) {
          result.error.push("Can't Add Duplicate Link");
        }
        result.error.push(url);
      }
      console.log(error.toString());
    }
  }
};

routes.post("/add-link", async ({ body }, res) => {
  const result = { valid: false, error: [] };
  const urls = body.Url.split("\n");
  for (const url of urls) {
    await createLink(url, body, result);
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
    if (Name) {
      const links = await db.Link.findAll({ where: { IsDownloading: true } });

      const [dl] = await db.DownloadingList.findOrCreate({ where: { Name } });

      if (dl) {
        await db.Downloading.destroy({ where: { DownloadingListId: dl.Id } });
        await db.Downloading.bulkCreate(links.map((lnk) => ({ LinkId: lnk.Id, DownloadingListId: dl.Id })));
      }

      return res.send({
        list: dl,
        downloads: await getDownloads(dl.Id),
      });
    }
    return res.send({
      error: "Name Empty",
    });
  } catch (error) {
    console.log(error);
    res.send({ error: `Name: ${Name} is in use` });
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

routes.get("/exclude-list/:Id", ExcludeChapRoutes.excludeChapList);
routes.post("/add-exclude", ExcludeChapRoutes.addExcludeChap);
routes.get("/remove-exclude/:Id", ExcludeChapRoutes.removeExcludeChap);

routes.get("/server/:Id", ServersRoutes.getServer);
routes.get("/servers-list/change/:Id", ServersRoutes.changeState);
routes.get("/servers-list/delete/:Id", ServersRoutes.removeServer);
routes.get("/servers-list/", ServersRoutes.getServers);

export default routes;
