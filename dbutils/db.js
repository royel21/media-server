import fs from "fs-extra";
import db from "../server/models/index.js";
import { compare } from "../src/stringUtils.js";
import { backupDb } from "../server/workers/backupdb.js";
import { restoreDb } from "../server/workers/restoredb.js";
import { literal } from "sequelize";

const { BACKUPDIR, DB } = process.env;

const capitalize = (val) => {
  let words = val.split(" ");
  for (let i = 0; i < words.length; i++) {
    words[i] = words[i].charAt(0).toUpperCase() + words[i].toLowerCase().slice(1);
  }
  return words.join(" ");
};

let i = 0;
const updateDb = async () => {
  await db.init();
  const update = async (items) => {
    for (let d of items) {
      const found = await db.folder.findOne({ where: { Name: d.Name } });
      if (found && d.Description) {
        await found.update(d);
        i++;
      }
    }
  };

  await update(fs.readJsonSync(`backup/${process.env.CDB}.json`));
  console.log("update", i);
};

const saveDb = async () => {
  let datas = [];
  const folders = await db.folder.findAll({
    order: ["Name"],
  });

  for (let folder of folders) {
    if (!datas.find((f) => compare(f, folder))) {
      datas.push({
        Name: folder.Name,
        AltName: folder.AltName,
        Genres: folder.Genres,
        Description: folder.Description,
        Status: folder.Status,
        IsAdult: folder.IsAdult,
        FilesType: folder.FilesType,
        Server: folder.Server,
      });
      i++;
    }
  }

  fs.writeJSONSync(`backup/${process.env.DB}.json`, datas);
  console.log("save", i, `backup/${process.env.DB}.json`);
};

const backup = async () => {
  await backupDb();
};

const restore = async () => {
  await restoreDb("mediaserverdb - 7-24-2023, 10'17'36 PM.json");
};

const test = async () => {
  db.sqlze.options.logging = console.log;
  const result = await db.folder.findAll({
    group: [literal("Path")],
    attributes: ["Name", "Path", [literal("count(Path)"), "Count"]],
  });
  console.log(result.length);
  process.exit();
};

const works = {
  updateDb,
  saveDb,
  backup,
  restore,
  test,
};

const action = process.argv[2];

if (action) {
  console.log(action);
  works[action]();
}
