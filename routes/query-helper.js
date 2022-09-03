const db = require("../models");

const qryCurrentPos = (Recent, table) => [
  db.sqlze.literal(
    `IFNULL((Select LastPos from RecentFiles where FileId = ${table}.Id and RecentId = '${Recent.Id}'), 0)`
  ),
  "CurrentPos",
];

const getOrderBy = (orderby, table = "") => {
  let desc = /nd/.test(orderby) ? "DESC" : "";
  let byName = db.sqlze.literal(`CAST(${table}.Name as unsigned) ${desc}, REPLACE(${table}.Name, '[','0') ${desc}`);

  const data = {
    du: ["CreatedAt", "DESC"],
    dd: ["CreatedAt", "ASC"],
  };
  console.log(data[orderby] || [byName], table, data.order);
  return [data[orderby] || [byName]];
};

const getFiles = async (user, data, model) => {
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
      [db.sqlze.literal(LastRead), "LastRead"],
    ],
    order: getOrderBy(data.order, "File"),
    offset: (data.page - 1) * +data.items,
    limit: +data.items,
    where: {
      [db.Op.or]: searchs,
    },
  };
  // by file type manga or video => future audio
  if (data.type)
    query.where.Type = {
      [db.Op.like]: `%${data.type || ""}%`,
    };

  // if we are getting files from a model folder-content include in the result
  if (model) {
    query.include = [
      {
        model,
        where: {
          Id: data.id,
        },
      },
    ];
  }

  files = await db.file.findAndCountAll(query);
  files.rows.map((f) => f.dataValues);

  return files;
};

const getFolders = async (req, res) => {
  const { filetype, dirid, order, page, items, search } = req.params;
  let limit = +items || 16;

  let favs = req.user.Favorites.map((f) => f.Id).join("','");

  let favSelect = `( Select FolderId from FavoriteFolders where \`Folders\`.\`Id\` = FolderId and FavoriteId IN ('${favs}'))`;

  let query = {
    attributes: [
      "Id",
      "Name",
      "Cover",
      "Type",
      "FilesType",
      "CreatedAt",
      "FileCount",
      [db.sqlze.literal(favSelect), "isFav"],
    ],
    where: {
      Name: {
        [db.Op.like]: `%${search || ""}%`,
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
    files: result.rows,
    totalFiles: result.count,
    totalPages: Math.ceil(result.count / limit),
  });
};

module.exports = {
  getFiles,
  getFolders,
  getOrderBy,
  qryCurrentPos,
};
