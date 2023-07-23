import db from "../models/index.js";

import { clamp, getFilter } from "./utils.js";

const { literal } = db.sqlze;

export const qryCurrentPos = (user, table) => [
  literal(`IFNULL((Select LastPos from RecentFiles where FileId = ${table}.Id and UserId = '${user.Id}'), 0)`),
  "CurrentPos",
];

export const getOrderBy = (orderby, table = "") => {
  let desc = /d$/.test(orderby) ? "DESC" : "ASC";
  let byName = literal(`REPLACE(REPLACE(${table}.Name, "-", "0"), "[","0") ${desc}`);

  const data = {
    du: ["CreatedAt", desc],
    dd: ["CreatedAt", desc],
  };

  return [data[orderby] || [byName]];
};

const getFolder = async (Id, user) => {
  const currentFile = `(Select currentFile from RecentFolders where FolderId = \`Folders\`.\`Id\` AND UserId = '${user.Id}')`;

  const query = {
    attributes: [
      "Id",
      "Name",
      "Description",
      "Status",
      "Genres",
      "AltName",
      "Server",
      [literal(currentFile), "currentFile"],
    ],
    where: { Id, IsAdult: { [db.Op.lte]: user.AdultPass } },
  };

  try {
    return await db.folder.findOne(query);
  } catch (error) {
    console.log(error);
  }
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
    attributes: ["Id", "Name", "Type", "Duration", "CreatedAt", qryCurrentPos(user, "File")],
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
    const folder = await getFolder(data.id, user);

    if (folder) {
      const count = await db.file.count(query);
      if (count) {
        const totalPages = Math.ceil(count / data.items);
        let page = clamp(data.page, 1, totalPages);

        query.offset = (page - 1) * +data.items;
        query.limit = +data.items;

        const rows = await db.file.findAll(query);

        return {
          totalFiles: count,
          files: rows.map((d) => ({ ...d.dataValues })),
          page,
          totalPages,
          valid: true,
          folder,
        };
      }
    } else {
      return { valid: false, msg: "Not Found Or Not authorized" };
    }
  } catch (error) {
    console.log(error.toString());
  }
  return { valid: false };
};

const mapFiles = ({ dataValues, Favorites }) => {
  const isFav = Favorites.map((fv) => fv.Id);
  delete dataValues.Genres;
  delete dataValues.Favorites;
  return { ...dataValues, isFav };
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
      IsAdult: req.user.AdultPass,
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
    if (result.count) {
      const totalPages = Math.ceil(result.count / limit);

      if (p > totalPages) p = totalPages;

      result.rows = await db.folder.findAll({
        ...query,
        include: { model: db.favorite, attributes: ["Id"], where: { UserId: req.user.Id }, required: false },
        order: getOrderBy(order, "Folders"),
        offset: (p - 1) * limit,
        limit,
      });
    }
  } catch (error) {
    console.log(error.toString());
  }

  return res.json({
    files: result.rows.map(mapFiles),
    totalFiles: result.count,
    totalPages: Math.ceil(result.count / limit),
    valid: true,
    page: p || 1,
  });
};
