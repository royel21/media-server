import fs from "fs-extra";
import { compare } from "../src/stringUtils.js";
import dbLoader, { createdb } from "../server/models/dbloader.js";
import backup from "../server/workers/backupdb.js";
import restore from "../server/workers/restoredb.js";

//Name: { [db.Op.like]: "HMangas%" },
const update = async () => {
  const db = await dbLoader("mediaserverdb");
  const founds = await db.folder.findAll({
    where: { Name: { [db.Op.like]: "% Raw" } },
  });
  for (let found of founds) {
    // if (!/various/.test(found.Name)) {
    //   found.AltName = "Comic " + found.Name;
    // }
    if (!found.AltName && !found.Description) {
      found.AltName = "N/A";
      found.Genres = "Adult, Raw";
      found.Description = "Raw manga";
      await found.save();
    }

    console.log(found.Name);
  }
  process.exit();
};

let i = 0;

const updateDbData = async (items, db) => {
  for (let d of items) {
    const found = await db.folder.findOne({ where: { Name: d.Name } });
    if (found && d.Description) {
      await found.update(d);
      i++;
    }
  }
  console.log("update", i);
  process.exit();
};

const updateDb = async () => {
  console.log("updatedb");
  const db = await dbLoader("mediaserverdb");
  await updateDbData(fs.readJsonSync(`db/mediaserverdb.json`), db);
};

const getData = async (db) => {
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
  return datas;
};

const saveDb = async () => {
  const db = await dbLoader("mediaserverdb");
  let datas = getData(db);

  fs.writeJSONSync(`db/${process.env.DB}.json`, datas);
  console.log("save", i, `db/${process.env.DB}.json`);
  process.exit();
};

const copyDataToSqlite = async () => {
  const mariadb = await dbLoader("mediaserverdb");

  const sqlite = await dbLoader("mediaserverdb", "sqlite");
  await sqlite.init();

  const datas = await getData(mariadb);
  updateDbData(datas, sqlite);
};

const copyDataToMariadb = async () => {
  const mariadb = await dbLoader("mediaserverdb");
  await mariadb.init();

  const sqlite = await dbLoader("mediaserverdb", "sqlite");

  const datas = await getData(sqlite);
  updateDbData(datas, mariadb);
};

const restoreDB = async () => {
  await restore("mediaserverdb2 - 25-Jul 23 AM 09'50'35.json");
};

const test = async () => {};

const works = {
  createdb,
  updateDb,
  saveDb,
  backup,
  restoreDB,
  test,
  copyDataToMariadb,
  copyDataToSqlite,
};

const action = process.argv[2];

if (action) {
  console.log(action);
  works[action](process.argv.slice(3));
}
