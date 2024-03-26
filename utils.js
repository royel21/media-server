import fs from "fs-extra";
import path from "path";
import db from "./server/models/index.js";
// import sharp from "sharp";
// import WinDir from "win-explorer";

// import zipper from "zip-local";

// // require("dotenv").config();
// // const db = require("./server/models");

// export const cleanDir = (basePath) => {
//   const result = WinDir.ListFilesRO(basePath);
//   for (const f of result) {
//     let emptyDirs = f.Files.filter((f) => f.isDirectory);
//     if (emptyDirs.length) {
//       console.log("Name:", f.Name);
//       for (const file of emptyDirs) {
//         console.log(file.Name);
//         fs.removeSync(path.join(basePath, f.Name, file.Name));
//       }
//     }
//   }
// };

// let baseDir = "";

// export const resize = async (p) => {
//   if (!baseDir) baseDir = p;

//   const imgs = fs.readdirSync(p);

//   for (let img of imgs) {
//     let file = path.join(p, img);

//     if (fs.statSync(file).isDirectory()) {
//       resize(file);
//     } else {
//       if (!fs.existsSync(path.join(p, "outdir"))) fs.mkdirSync(path.join(p, "outdir"));

//       await sharp(file).jpeg({ quality: 75 }).toFile(path.join(p, "outdir", img));
//     }
//   }
//   if (p === baseDir) baseDir = "";
// };

// const compressDirs = (baseDir) => {
//   const dirs = fs.readdirSync(baseDir);
//   for (let dir of dirs) {
//     const toZip = path.join(baseDir, dir);
//     zipper.sync
//       .zip(toZip)
//       .compress()
//       .save(toZip + ".zip");
//   }
// };

// export default {
//   resize,
//   cleanDir,
//   compressDirs,
// };
const reset = async () => {
  // const folders = await db.folder.findAll({ where: { DirectoryId: "QXSlHW", Genres: { [db.Op.like]: "% Manga%" } } });
  // for (const folder of folders) {
  //   const nPath = folder.Path.replace("webtoon", "Mangas");
  //   fs.moveSync(folder.Path, nPath);
  //   folder.DirectoryId = "q8ffmV";
  //   folder.Path = nPath;
  //   await folder.save();
  //   console.log(nPath);
  // }
  const name =
    "Hitori H yori Kimochii Koto Oshieteageru / I'll tell you what feels better than having sex by yourself.";
  console.log(name.replace(/ \//i, ""));
  console.log(name);
  process.exit();
};
reset();
