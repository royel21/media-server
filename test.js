require("dotenv").config();
const db = require("./models");

let sortByName = (a, b) => {
  let n1 = a.Name.replace("-", ".").match(/\d+.\d+|\d+/);
  let n2 = b.Name.replace("-", ".").match(/\d+.\d+|\d+/);

  if (n1 && n2) {
    return Number(n1[0]) - Number(n2[0]);
  } else {
    return a.Name.replace("-", "Z").localeCompare(b.Name.replace("-", "Z"));
  }
};

// db.sqlze.options.logging = console.log;
// const test = async () => {

//     const folders = await db.folder.findAndCountAll({ order: ["Name"] });
//     console.log(folders.count);
//     for (let f of folders.rows) {
//         console.log(f.Name);
//     }
// };

// test();
// const { getFolders } = require("./routes/query-helper");
const testDb = async ({ user, data }) => {
  let files = { count: 0, rows: [] };
  let searchs = [];
  console.time("time");
  for (let s of (data.search || "").split("|")) {
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
          "(Select LastPos from RecentFiles where FileId = File.Id and RecentId = '" + user.Recent.Id + "')"
        ),
        "CurrentPos",
      ],
      [
        db.sqlze.literal(
          "(Select LastRead from RecentFiles where FileId = File.Id and RecentId = '" + user.Recent.Id + "')"
        ),
        "LastRead",
      ],
    ],
    where: {
      [db.Op.or]: searchs,
    },
    offset: 1,
    limit: 100,
    include: [
      {
        model: db.folder,
        where: {
          Id: "47MnzX",
        },
      },
    ],
  };

  files = await db.file.findAndCountAll(query);
  files.rows.map((f) => f.dataValues);

  // offset: (data.page - 1) * data.items,
  //     limit: parseInt(data.items),

  console.timeEnd("time");
  console.log(files.rows.map((f) => f.Name));
};

testDb({ data: { search: "" }, user: { Recent: {} } });
// testDb();
// db.init().then(testDb);
// const db = require("./models");
// const { getOrderBy } = require("./routes/query-helper");
// db.sqlze.options.logging = console.log;
// const getFolders = async (req, res) => {
//     const folders = await db.folder.findAll({
//         where: {
//             [db.Op.and]: {
//                 Name: { [db.Op.like]: "% raw%" },
//                 path: { [db.Op.notLike]: "%Webtoon Raw%" },
//             },
//         },
//     });
//     folders.forEach(async (f) => {
//         await f.update({ Path: f.Path.replace(/\/\//gi, "/Webtoon Raw/") });
//         console.log(f.Path, f.Path.replace(/\/\//gi, "/Webtoon Raw/"));
//     });
// };
// getFolders();
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

// const fs = require("fs-extra");
// const path = require("path");

// const bpath = "/mnt/5TBHDD/R18/HMangas/HMangas I-J";
// const from = path.join(bpath, "[Ishiba Yoshikazu, Rohgun] Sengoku Academy Fighting Maiden Nobunaga! ~Lewd Flower Profusion, The Great Swimsuit War~ [English] [Kizlan].zip");
// console.log(fs.existsSync(from));
// console.log(from)
// const drivelist = require("drivelist");
// const windir = require("win-explorer");
// let file = windir.ListFiles("E:/Anime1/", { oneFile: true });
// console.log(file);
// const fs = require("fs-extra");
// const path = require("path");
// const rename = (basepath) => {
//     //get all files
//     console.log("Dir: ", basepath);
//     let files = fs.readdirSync(basepath);
//     let img = files.find((f) => f.includes(".jpg"));
//     if (img) img = img.replace(".jpg", "");
//     for (let f of files) {
//         let file = path.join(basepath, f);

//         if (fs.statSync(file).isDirectory()) {
//             rename(file);
//         } else if (f.includes(".zip")) {
//             let old = path.join(basepath, f);
//             let regex = new RegExp(`${img} `, "ig");

//             let newF = path.join(basepath, f.replace(regex, ""));
//             if (!fs.existsSync(newF)) fs.moveSync(old, newF);
//             // console.log("1: ", old);
//             // console.log("2: ", newF, "\n");
//         }
//     }
// };

// rename("M:/webtoon");
// .replace(/[A-Za-z]+/ig,"Chapter ")

// const rmOrpFiles = async (folder) => {
//     const files = await folder.getFiles();
//     for (const file of files) {
//         if (!fs.existsSync(path.join(folder.Path, file.Name))) {
//             await file.destroy();
//         }
//     }
// };

// const rmOrphanFiles = async (Id, isFolder) => {
//     console.log("remove olphan ");
//     if (isFolder) {
//         const folder = await db.folder.findByPk(Id);
//         if (fs.existsSync(folder.Path)) await rmOrpFiles(folder);
//     } else {
//         const directory = await db.directory.findByPk(Id);
//         if (fs.existsSync(directory.FullPath)) {
//             const folders = await directory.getFolders();
//             for (const folder of folders) {
//                 await rmOrpFiles(folder);
//             }
//         }
//     }
// };

// rmOrphanFiles();
// const basedir = "M:\\webtoon";

// const removeFiles = (filePath) => {
//     console.log(filePath);
//     const files = fs.readdirSync(filePath);
//     for (let f of files.filter((f) => !f.includes(".jpg"))) {
//         let file = path.join(filePath, f);
//         if (fs.statSync(file).isDirectory()) {
//             removeFiles(file);
//         } else if (f.match(/^[A-Za-z]/)) {
//             // fs.removeSync(path.join(dir, f));
//             console.log(f.replace(/^[A-Za-z -!\'.]+/i, ""));

//             let oldF = path.join(filePath, f);
//             let newF = path.join(filePath, f.replace(/^[A-Za-z -!’\'.]+/i, ""));

//             try {
//                 fs.moveSync(oldF, newF);
//             } catch (error) {
//                 console.log(error);
//                 return;
//             }
//         }
//     }
// };

// removeFiles(basedir);
