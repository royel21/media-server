import fs from "fs-extra";
import { compare } from "../src/stringUtils.js";
import dbLoader, { createdb } from "../server/models/dbloader.js";
import backup, { getUserData } from "../server/workers/backupdb.js";
import restore, { createUserAndFav } from "../server/workers/restoredb.js";
import { literal } from "sequelize";

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

const copyFavToMariadb = async () => {
  const mariadb = await dbLoader("mediaserverdb");

  const sqlite = await dbLoader("mediaserverdb", "sqlite");
  await sqlite.init();

  const users = await sqlite.user.findAll({
    include: [
      {
        model: sqlite.favorite,
        required: false,
        include: { model: sqlite.folder, attributes: ["Path"], required: false },
      },
    ],
  });
  const datas = await getUserData(users, sqlite);
  for (const user of datas) {
    console.log(user.Name);
    await createUserAndFav(user, mariadb);
  }
  process.exit();
};

const mapFolders = (f) => f.replace("/mnt/5TBHDD/", "F:\\").split("/").join("\\");
const mapFolders2 = (f) => {
  f.Folder = f.Folder.replace("/mnt/5TBHDD/", "F:\\").split("/").join("\\");

  return f;
};
const mapFolders3 = (f) => {
  f.Path = f.Path.replace("/mnt/5TBHDD/", "F:\\").split("/").join("\\");

  return f;
};

const copyFavToSqlite = async () => {
  const mariadb = await dbLoader("mediaserverdb");
  await mariadb.init();

  const sqlite = await dbLoader("mediaserverdb", "sqlite");

  const users = await mariadb.user.findAll({
    include: [
      {
        model: mariadb.favorite,
        required: false,
        include: { model: mariadb.folder, attributes: ["Path"], required: false },
      },
    ],
  });
  const datas = await getUserData(users, mariadb);
  for (const user of datas) {
    console.log(user.Name);
    for (let fav of user.Favorites) {
      fav.Folders = fav.Folders.map(mapFolders);
    }
    user.RecentFiles = user.RecentFiles.filter((f) => f.Folder).map(mapFolders2);
    user.RecentFolders = user.RecentFolders.filter((f) => f.Path).map(mapFolders3);
    await createUserAndFav(user, sqlite, true);
  }
  process.exit();
};

const test = async () => {
  const db = await dbLoader("mediaserverdb");
  db.sqlze.options.logging = console.log;
  let table = await db.folder.findOne({
    order: [literal(`REPLACE(REPLACE(Files.Name, "-", "0"), "[","0") ASC`)],
    where: { Id: "bI9pm4" },
    include: {
      model: db.file,
      attributes: ["Id", "Name", "Type", "Duration", "FolderId"],
    },
  });
  table.Files.forEach((f) => console.log(f.Name));
  process.exit();
};

const works = {
  createdb,
  updateDb,
  saveDb,
  backup,
  restoreDB,
  test,
  copyDataToMariadb,
  copyDataToSqlite,
  copyFavToMariadb,
  copyFavToSqlite,
};

const action = process.argv[2];

if (action) {
  console.log(action);
  works[action](process.argv.slice(3));
}
