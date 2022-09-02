require("dotenv").config();
const WinDir = require("win-explorer");
const db = require("./models");

const fs = require("fs-extra");

const basePath = "/mnt/5TBHDD/mangas";
console.time("list");
const result = WinDir.ListFilesRO(basePath);
console.timeEnd("list");

console.log("files found", result.length, result[0].Files[0]);
for (const f of result) {
  if (f.Files.find((f) => f.isDirectory)) {
    console.log(f.Name);
  }
}

// const runTest = async () => {

// };

// runTest();
///Furyou Taimashi Reina
