const db = require("../models");

const getOrderBy = (orderby, table = "") => {
    let nameOrder = db.sqlze.literal(`REPLACE("${table}Name", '[','0')`);
    let order = [];
    switch (orderby) {
        case "nd": {
            order.push([nameOrder, "DESC"]);
            break;
        }
        case "du": {
            order.push(["CreatedAt", "DESC"]);
            break;
        }
        case "dd": {
            order.push(["CreatedAt", "ASC"]);
            break;
        }
        default: {
            order.push(nameOrder);
        }
    }
    return order;
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

    let query = {
        attributes: [
            "Id",
            "Name",
            "Type",
            "Duration",
            "Cover",
            "CreatedAt",
            [
                db.sqlze.literal(
                    "(Select LastPos from RecentFiles where FileId = File.Id and RecentId = '" +
                        user.Recent.Id +
                        "')"
                ),
                "CurrentPos",
            ],
            [
                db.sqlze.literal(
                    "(Select LastRead from RecentFiles where FileId = File.Id and RecentId = '" +
                        user.Recent.Id +
                        "')"
                ),
                "LastRead",
            ],
        ],
        order: getOrderBy(data.order, "File."),
        offset: (data.page - 1) * data.items,
        limit: parseInt(data.items),
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

exports.getFilesList = async (user, res, type, params, model) => {
    let data = {};
    try {
        data = await getFiles(user, { type, ...params }, model);
    } catch (err) {
        console.log(err);
    }
    let pagedata = {
        files: data.rows,
        totalFiles: data.count,
        totalPages: Math.ceil(data.count / params.items),
    };
    return res ? res.json(pagedata) : pagedata;
};

exports.getFolders = async (req, res) => {
    const { filetype, order, page, items, search } = req.params;
    let favs = req.user.Favorites.map((f) => f.Id).join("','");
    console.log(favs);
    let favSelect =
        "Select FolderId from FavoriteFolders where `Folders`.`Id` = FolderId and FavoriteId IN";
    let result = await db.folder.findAndCountAll({
        attributes: [
            "Id",
            "Name",
            "Cover",
            "Type",
            "FilesType",
            "CreatedAt",
            "FileCount",
            [db.sqlze.literal(`( ${favSelect} ('${favs}'))`), "isFav"],
        ],
        where: {
            Name: {
                [db.Op.like]: `%${search || ""}%`,
            },
            FilesType: filetype,
        },
        order: getOrderBy(order, ""),
        offset: (page - 1) * items,
        limit: parseInt(items),
    });
    return res.json({
        files: result.rows,
        totalFiles: result.count,
        totalPages: Math.ceil(result.count / items),
    });
};

exports.getFolderContent = async (req) => {
    const { id, order, page, items, search } = req.params;

    let result = await db.folder.findAndCountAll({
        where: {
            Id: id,
            Name: {
                [db.Op.like]: `%${search || ""}%`,
            },
        },
        order: [["Name", order === "nu" ? "ASC" : "DESC"]],
        offset: (page - 1) * items,
        limit: parseInt(items),
    });
    return {
        files: result.rows,
        totalFiles: result.count,
        totalPages: result.count / items,
    };
};

exports.getOrderBy = getOrderBy;
