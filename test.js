require("dotenv").config();
const db = require("./models");
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
const testDb = async () => {
    // await db.init(true);
    // console.time("time");
    // let user = await db.user.findOne({
    //     where: { Name: "Royel" },
    //     include: [{ model: db.recent }, { model: db.favorite }],
    // });
    // const req = {
    //     user,
    //     params: { filetype: "videos", order: "nu", page: 1, items: 10, search: "" },
    // };
    // const res = {
    //     json: (data) => {
    //         for (let f of data.files) {
    //             console.log(f.dataValues.Name);
    //         }
    //     },
    // };
    // await getFolders(req, res);
    // console.timeEnd("time");
};
// testDb();
// db.init().then(testDb);
// const db = require("./models");
// const { getOrderBy } = require("./routes/query-helper");
// db.sqlze.options.logging = console.log;
const getFolders = async (req, res) => {
    const folders = await db.folder.findAll({
        where: {
            [db.Op.and]: {
                Name: { [db.Op.like]: "% raw%" },
                path: { [db.Op.notLike]: "%Webtoon Raw%" },
            },
        },
    });
    folders.forEach(async (f) => {
        await f.update({ Path: f.Path.replace(/\/\//gi, "/Webtoon Raw/") });
        console.log(f.Path, f.Path.replace(/\/\//gi, "/Webtoon Raw/"));
    });
};
getFolders();
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

// const { nanoid } = require("nanoid");
// const os = require("os");
const fs = require("fs-extra");
const path = require("path");
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
const basedir = "M:\\webtoon";

const removeFiles = (filePath) => {
    console.log(filePath);
    const files = fs.readdirSync(filePath);
    for (let f of files.filter((f) => !f.includes(".jpg"))) {
        let file = path.join(filePath, f);
        if (fs.statSync(file).isDirectory()) {
            removeFiles(file);
        } else if (f.match(/^[A-Za-z]/)) {
            // fs.removeSync(path.join(dir, f));
            console.log(f.replace(/^[A-Za-z -!\'.]+/i, ""));

            let oldF = path.join(filePath, f);
            let newF = path.join(filePath, f.replace(/^[A-Za-z -!’\'.]+/i, ""));

            try {
                fs.moveSync(oldF, newF);
            } catch (error) {
                console.log(error);
                return;
            }
        }
    }
};

removeFiles(basedir);
