import db from "../models/index.js";

import { clamp, getFilter } from "./utils.js";

const { literal } = db.sqlze;

export const qryCurrentPos = (Recent, table) => [
  literal(`IFNULL((Select LastPos from RecentFiles where FileId = ${table}.Id and RecentId = '${Recent.Id}'), 0)`),
  "CurrentPos",
];

export const getOrderBy = (orderby, table = "") => {
  let desc = /nd/.test(orderby) ? "DESC" : "";
  let byName = literal(`REPLACE(REPLACE(${table}.Name, "-", "0"), "[","0") ${desc}`);

  const data = {
    du: ["CreatedAt", "DESC"],
    dd: ["CreatedAt", "ASC"],
  };

  return [data[orderby] || [byName]];
};

export const getFiles = async (user, data) => {
  let searchs = [];
  let search = data.search || "";

  for (let s of search.split("|")) {
    searchs.push({
      Name: {
        [db.Op.like]: "%" + s + "%",
      },
    });
  }

  let query = {
    attributes: ["Id", "Name", "Type", "Duration", "CreatedAt", qryCurrentPos(user.Recent, "File")],
    order: getOrderBy(data.order, "File"),
    where: {
      [db.Op.or]: searchs,
      FolderId: data.id,
    },
  };
  // by file type manga or video => future audio
  if (data.type) {
    query.where.Type = {
      [db.Op.like]: `%${data.type || ""}%`,
    };
  }

  try {
    const count = await db.file.count(query);

    const totalPages = Math.ceil(count / data.items);
    let page = clamp(data.page, 1, totalPages);

    query.offset = (page - 1) * +data.items;
    query.limit = +data.items;

    const rows = await db.file.findAll(query);

    const folder = await db.folder.findOne({
      attributes: ["Id", "Name"],
      where: { Id: data.id },
    });

    return { totalFiles: count, files: rows.map((d) => ({ ...d.dataValues })), page, totalPages, valid: true, folder };
  } catch (error) {
    console.log(error);
    return { valid: false };
  }
};

export const getFolders = async (req, res) => {
  const { filetype, dirid, order, page, items, search } = req.params;

  let limit = +items || 16;

  let filter = getFilter(search);

  let query = {
    attributes: ["Id", "Name", "Type", "Genres", "FilesType", "CreatedAt", "Status", "FileCount"],
    where: {
      [db.Op.or]: {
        Name: filter,
        AltName: filter,
        Genres: filter,
        Server: filter,
      },
      IsAdult: { [db.Op.lte]: req.user.AdultPass },
      FilesType: filetype,
    },
  };

  if (["mangas", "videos"].includes(filetype)) {
    query.where.DirectoryId = dirid;
  }

  let result = { rows: [], count: 0 };
  let p = +page || 1;

  try {
    result.count = await db.folder.count(query);

    const totalPages = Math.ceil(result.count / limit);

    if (p > totalPages) p = totalPages;

    result.rows = await db.folder.findAll({
      ...query,
      include: { model: db.favorite, attributes: ["Id"] },
      order: getOrderBy(order, "Folders"),
      offset: (p - 1) * limit,
      limit,
    });
  } catch (error) {
    console.log(error);
  }

  const mapFiles = ({ dataValues, Favorites }) => {
    const isFav = Favorites.map((fv) => fv.Id);
    return { ...dataValues, isFav };
  };

  return res.json({
    files: result.rows.map(mapFiles),
    totalFiles: result.count,
    totalPages: Math.ceil(result.count / limit),
    valid: true,
    page: p || 1,
  });
};
