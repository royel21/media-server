const fs = require("fs-extra");
const path = require("path");
const sharp = require("sharp");
const WinDir = require("win-explorer");

require("dotenv").config();
const db = require("./server/models");

module.exports.cleanDir = (basePath) => {
  const result = WinDir.ListFilesRO(basePath);
  for (const f of result) {
    let emptyDirs = f.Files.filter((f) => f.isDirectory);
    if (emptyDirs.length) {
      console.log("Name:", f.Name);
      for (const file of emptyDirs) {
        console.log(file.Name);
        fs.removeSync(path.join(basePath, f.Name, file.Name));
      }
    }
  }
};

const resize = (imgs) => {
  for (let img of imgs) {
    sharp(fs.readFileSync(img))
      .jpeg({ quality: 75 })
      .resize({ width: 1080 })
      .toFile("dir/" + img);
  }
};
resize(["./00.jpg"]);
