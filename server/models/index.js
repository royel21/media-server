import Sequelize from "sequelize";
import user from "./user.js";
import file from "./file.js";
import folder from "./folder.js";
import favorite from "./favorites.js";
// import hotkeys from "./hotkey.js";
// import sortTab from "./sorttab.js";
import directory from "./directories.js";
import favoriteFolder from "./favorite-folder.js";
import recentFolder from "./recent-folder.js";
import recentFile from "./recent-file.js";
import eventLog from "./eventlog.js";
//Dwonloader Models
import Links from "./Links.js";
import Servers from "./Servers.js";
import NameLists from "./NameLists.js";
import Excludes from "./Excludes.js";
import DownloadingList from "./DownloadingList.js";
import Downloading from "./Downloading.js";

import dbconfig from "./config.js";
import { config as configEnv } from "dotenv";
import defaultConfig from "../default-config.js";
configEnv();

const { dbConnector, dbName, dbStorage, dbUser, dbPassword, dbHost } = defaultConfig;

const config = dbconfig[dbConnector];
config.host = dbHost;
config.storage = dbStorage;

const sequelize = new Sequelize(dbName, dbUser, dbPassword, config);
const isSqlite = /sqlite/i.test(dbConnector);
const db = {
  Op: Sequelize.Op,
  sqlze: sequelize,
  user: user(sequelize),
  file: file(sequelize),
  folder: folder(sequelize, isSqlite),
  favorite: favorite(sequelize),
  // hotkey: hotkeys(sequelize),
  // sorttab: sortTab(sequelize),
  directory: directory(sequelize),
  favoriteFolder: favoriteFolder(sequelize),
  recentFolder: recentFolder(sequelize),
  recentFile: recentFile(sequelize),
  eventLog: eventLog(sequelize),
  Link: Links(sequelize, isSqlite),
  Server: Servers(sequelize),
  NameList: NameLists(sequelize),
  Exclude: Excludes(sequelize),
  DownloadingList: DownloadingList(sequelize),
  Downloading: Downloading(sequelize),
};

db.favorite.belongsToMany(db.folder, { through: { model: db.favoriteFolder } });

db.folder.belongsToMany(db.favorite, {
  through: { model: db.favoriteFolder, onDelete: "cascade" },
});

db.user.hasMany(db.recentFolder, { onDelete: "cascade" });
db.user.hasMany(db.recentFile, { onDelete: "cascade" });

db.folder.hasOne(db.recentFolder);
db.recentFolder.belongsTo(db.folder);
db.recentFile.belongsTo(db.file, {
  foreignKey: "FileId",
  onDelete: "SET NULL",
  onUpdate: "cascade",
});

db.recentFolder.belongsTo(db.file, {
  foreignKey: "CurrentFile",
  onDelete: "SET NULL",
  onUpdate: "cascade",
});

db.folder.belongsTo(db.directory, { onDelete: "cascade" });
db.directory.hasMany(db.folder);

db.file.belongsTo(db.folder, { onDelete: "cascade", onUpdate: "cascade" });
db.folder.hasMany(db.file);

db.user.hasMany(db.favorite, { onDelete: "cascade" });

// db.user.hasMany(db.hotkey, { onDelete: "cascade" });
// db.user.hasMany(db.sorttab, { onDelete: "cascade" });

db.Server.hasMany(db.Link, { onDelete: "CASCADE" });
db.Link.belongsTo(db.Server, { foreignKey: "ServerId" });

db.DownloadingList.hasMany(db.Downloading, { onDelete: "CASCADE" });
db.Downloading.belongsTo(db.Link, { foreignKey: "LinkId", onDelete: "CASCADE" });

db.init = async (force) => {
  await sequelize.sync({ force });

  try {
    let admin = await db.user.findOne({ where: { Name: "Administrator" } });

    if (!admin) {
      await db.user.create(
        {
          Name: "Administrator",
          Password: "Admin",
          Role: "Administrator",
          UserConfig: {
            Name: "Administrator",
            Config: JSON.stringify({
              order: "nu",
              items: 0,
              recentFolders: [],
              video: {
                KeysMap: {},
                volume: 0.3,
                pause: true,
                mute: false,
              },
              manga: {
                KeysMap: {},
                scaleX: 0.6,
                scaleY: 1,
                aniDuration: 300,
              },
            }),
          },
        },
        {
          include: [db.favorite],
          encript: true,
        }
      );
    }
  } catch (error) {}
};

export const createdb = async () => {
  if (dbConnector === "mariadb") {
    const sequelize = new Sequelize("", dbUser, dbPassword, { dialect: dbConnector, host: dbHost });
    await sequelize.query(`CREATE DATABASE if not exists ${dbName}`);
    return sequelize.close();
  }
};

export default db;
