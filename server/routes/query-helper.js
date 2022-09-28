import db from "../models/index.js";

import { getFilter } from "./utils.js";

const { literal } = db.sqlze;

export const qryCurrentPos = (Recent, table) => [
  literal(`IFNULL((Select LastPos from RecentFiles where FileId = ${table}.Id and RecentId = '${Recent.Id}'), 0)`),
  "CurrentPos",
];

export const getOrderBy = (orderby, table = "") => {
  let desc = /nd/.test(orderby) ? "DESC" : "";
  let byName = literal(`REPLACE(${table}.Name, '[','0') ${desc}`);

  if (table === "File") {
    byName = literal(`CAST(${table}.Name as unsigned) ${desc}, REPLACE(${table}.Name, '[','0') ${desc}`);
  }

  const data = {
    du: ["CreatedAt", "DESC"],
    dd: ["CreatedAt", "ASC"],
  };

  return [data[orderby] || [byName]];
};

export const getFiles = async (user, data) => {
  let files = { count: 0, rows: [] };
  let searchs = [];
  let search = data.search || "";

  for (let s of search.split("|")) {
    searchs.push({
      Name: {
        [db.Op.like]: "%" + s + "%",
      },
    });
  }
  const LastRead = "(Select LastRead from RecentFiles where FileId = File.Id and RecentId = '" + user.Recent.Id + "')";

  let query = {
    attributes: [
      "Id",
      "Name",
      "Type",
      "Duration",
      "Cover",
      "CreatedAt",
      qryCurrentPos(user.Recent, "File"),
      [literal(LastRead), "LastRead"],
    ],
    order: getOrderBy(data.order, "File"),
    offset: (data.page - 1) * +data.items,
    limit: +data.items,
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

  return db.file.findAndCountAll(query);
};

export const getFolders = async (req, res) => {
  const { filetype, dirid, order, page, items, search } = req.params;
  let filterTerm = search || "";

  let limit = +items || 16;

  let favs = req.user.Favorites.map((f) => f.Id).join("','");

  let favSelect = `( Select FolderId from FavoriteFolders where \`Folders\`.\`Id\` = FolderId and FavoriteId IN ('${favs}'))`;

  let query = {
    attributes: [
      "Id",
      "Name",
      "Cover",
      "Type",
      "Genres",
      "FilesType",
      "CreatedAt",
      "Status",
      "FileCount",
      [literal(favSelect), "isFav"],
    ],
    where: {
      [db.Op.or]: {
        Name: getFilter(filterTerm),
        Genres: getFilter(filterTerm),
      },
      FilesType: filetype,
    },
    order: getOrderBy(order, "Folders"),
    offset: (page - 1) * limit,
    limit,
  };

  if (["mangas", "videos"].includes(filetype)) {
    query.where.DirectoryId = dirid;
  }

  let result = await db.folder.findAndCountAll(query);

  return res.json({
    files: result.rows.map((fd) => ({ ...fd.dataValues, Cover: encodeURI(fd.Cover) })),
    totalFiles: result.count,
    totalPages: Math.ceil(result.count / limit),
    valid: true,
  });
};
