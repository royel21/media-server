const db = require("./models");
db.sqlze.options.logging = console.log;

const testDb = async () => {
  console.time("time");
  let user = await db.user.findOne({
    where: { Name: "Royel" },
    include: { model: db.recent },
  });

  let folders = await user.Recent.getFolders({
    limit: 20,
    order: [[db.sqlze.literal("RecentFolders.LastRead"), "DESC"]],
  });
  let result = folders.map((f) => {
    return { ...f.dataValues, RecentFolders: "", ...f.RecentFolders.dataValues };
  });
  console.timeEnd("time");
  console.log(result);
};
testDb();
// db.init().then(testDb);
// const db = require("./models");
// const { getOrderBy } = require("./routes/query-helper");
// db.sqlze.options.logging = console.log;
// const getFolders = async (req, res) => {
//   const { filetype, order, page, items, search } = req.params;
//   let favs = req.user.Favorites.map((f) => f.Id).join("','");
//   console.log(favs);
//   let favSelect =
//     "Select FolderId from FavoriteFolders where `Folders`.`Id` == Id and FavoriteId IN";
//   let result = await db.folder.findAndCountAll({
//     attributes: [
//       "Id",
//       "Name",
//       "Cover",
//       "Type",
//       "FilesType",
//       "CreatedAt",
//       "FileCount",
//       [db.sqlze.literal(`( ${favSelect} ('${favs}'))`), "isFav"],
//     ],
//     where: {
//       Name: {
//         [db.Op.like]: `%${search || ""}%`,
//       },
//       FilesType: filetype,
//     },
//     order: getOrderBy(order, "Files."),
//     offset: (page - 1) * items,
//     limit: items,
//   });
//   return res.json({
//     files: result.rows,
//     totalFiles: result.count,
//     totalPages: Math.ceil(result.count / items),
//   });
// };

// const req = {
//   params: { filetype: "mangas", order: "nu", page: 1, items: 10, search: "" },
// };
// const res = {
//   json: (data) => {
//     for (let f of data.files) console.log(f.dataValues);
//   },
// };
// const test = async () => {
//   await db.init();
//   let user = await db.user.findOne({
//     where: { Name: "Royel" },
//     include: { model: db.favorite },
//   });
//   req.user = user;

//   await getFolders(req, res);
// };

// test();

// const sharp = require("sharp");
// const StreamZip = require("node-stream-zip");
// const images = /jpg|jpeg|png|gif|webp/i;

// var zip = new StreamZip({
//   file: "./zip.zip",
//   storeEntries: true,
// });

// zip.on("ready", async () => {
//   var entries = Object.values(zip.entries())
//     .sort((a, b) => {
//       return String(a.name).localeCompare(String(b.name));
//     })
//     .filter((entry) => {
//       return !entry.isDirectory;
//     });

//   var firstImg = entries.find((e) => {
//     return images.test(e.name.split(".").pop()) && e.size > 1024 * 30;
//   });

//   let buff = zip.entryDataSync(firstImg);
//   try {
//     let sharData = sharp(buff);
//     let meta = await sharData.metadata();
//     console.log(meta);
//     if (meta.height > 1024) {
//       sharData = await sharData.extract({
//         height: 1024,
//         width: meta.width,
//         top: 0,
//         left: 0,
//       });
//     }

//     sharData
//       .jpeg({
//         quality: 100,
//       })
//       .resize(240)
//       .toFile("./test3.jpg", () => {
//         zip.close();
//         buff = [];
//       });
//   } catch (err) {
//     console.log(err);
//     resolve(0);
//   }
// });
