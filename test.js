require("dotenv").config();
const WinDir = require("win-explorer");
const db = require("./models");

const fs = require("fs-extra");

const basePath = "F:\\Manga";

const runTest = async () => {
  let folders = await db.folder.findAll();

  for (let folder of fs.readdirSync(basePath)) {
    if (!folders.find((f) => f.Name === folder)) {
      console.log(folder);
    }
  }
};

runTest();
