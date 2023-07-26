import fs from "fs-extra";
import db from "../server/models/index.js";
import { compare } from "../src/stringUtils.js";
import { backupDb } from "../server/workers/backupdb.js";
import { restoreDb } from "../server/workers/restoredb.js";
import { Sequelize, literal } from "sequelize";

const { BACKUPDIR, DB, HOST, HOST2 } = process.env;

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
        if (d.AltName !== "N/A") {
          d.AltName = capitalize(d.AltName.replace("',", ""));
        }
        // console.log(found.Name);
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

const isWork = process.env.USERNAME === "rconsoro";

const createdb = async (args) => {
  if (args?.length > 2) {
    const sequelize = new Sequelize("", args[1], args[2], {
      logging: console.log,
      dialect: "mariadb",
      host: isWork ? HOST : HOST2,
      pool: 5,
      dialectOption: {
        timezone: "Etc/GMT-4",
      },
    });
    await sequelize.query(`CREATE DATABASE if not exists ${args[0]}`);
    return sequelize.close();
  }
};

const works = {
  createdb,
  updateDb,
  saveDb,
  backup,
  restore,
  test,
};

const action = process.argv[2];

if (action) {
  console.log(action);
  works[action](process.argv.slice(3));
}
