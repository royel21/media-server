require("dotenv").config();
const WinDir = require("win-explorer");
const db = require("./models");
const path = require("path");
const fs = require("fs-extra");

// const removeEmptyDirs = (basePath) => {
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

// const basePath = "F:/Manga";
// console.time("list");
// const result = WinDir.ListFilesRO(basePath);
// console.timeEnd("list");

// console.log("files found", result.length);

// removeEmptyDirs(basePath);
db.sqlze.options.logging = console.log;
const limit = 16;
const page = 5000;

const query1 = {
  order: [db.sqlze.literal("REPLACE(File.Name, '[','0')")],
  attribute: ["Id", "Name"],
  offset: ((page || 1) - 1) * limit,
  limit,
  where: {
    Name: {
      [db.Op.like]: `%.zip%`,
    },
  },
};

const query2 = {
  order: ["Name"],
  attributes: [
    "Id",
    "Name",
    "FolderId",
    "CreatedAt",
    [db.sqlze.literal("(Select Path from Folders where Id=`File`.`FolderId`)"), "Path"],
  ],
  offset: ((+page || 1) - 1) * limit,
  limit,
  where: {
    Name: {
      [db.Op.like]: `%.zip%`,
    },
  },
};

const runTest = async () => {
  console.time("list");
  let files = await db.file.findAll(query1);
  console.timeEnd("list");

  console.log("files:", files.length);
  console.time("list");
  files = await db.file.findAll(query2);
  console.timeEnd("list");
  console.log("files:", files.length);
};

runTest();
///Furyou Taimashi Reina
