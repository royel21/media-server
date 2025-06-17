import Sequelize from "sequelize";
import os from "node:os";

import user from "./user.js";
import file from "./file.js";
import folder from "./folder.js";
import favorite from "./favorites.js";
import hotkeys from "./hotkey.js";
import sortTab from "./sorttab.js";
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
import AppConfig from "./AppConfig.js";
import fs from "fs-extra";

configEnv();

const { dbConnector, dbName, dbStorage, dbUser, dbPassword, dbHost } = defaultConfig;

const config = dbconfig[dbConnector];
config.host = dbHost;
config.storage = dbStorage;

const sequelize = new Sequelize(dbName, dbUser, dbPassword, config);
const db = {};

db.Op = Sequelize.Op;
db.sqlze = sequelize;
db.AppConfig = AppConfig(sequelize);
db.user = user(sequelize);
db.file = file(sequelize, db);
db.folder = folder(sequelize, db);
db.favorite = favorite(sequelize);
db.hotkey = hotkeys(sequelize);
db.sorttab = sortTab(sequelize);
db.directory = directory(sequelize);
db.favoriteFolder = favoriteFolder(sequelize);
db.recentFolder = recentFolder(sequelize);
db.recentFile = recentFile(sequelize);
db.eventLog = eventLog(sequelize);
db.Link = Links(sequelize);
db.Server = Servers(sequelize);
db.NameList = NameLists(sequelize);
db.Exclude = Excludes(sequelize);
db.DownloadingList = DownloadingList(sequelize);
db.Downloading = Downloading(sequelize);
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

db.user.hasMany(db.hotkey, { onDelete: "cascade" });
db.user.hasMany(db.sorttab, { onDelete: "cascade" });

db.Server.hasMany(db.Link, { onDelete: "CASCADE" });
db.Link.belongsTo(db.Server, { foreignKey: "ServerId" });

db.DownloadingList.hasMany(db.Downloading, { onDelete: "CASCADE" });
db.Downloading.belongsTo(db.Link, { foreignKey: "LinkId", onDelete: "CASCADE" });

const queries = [];

db.init = async (force) => {
  for (const q of queries) {
    try {
      await db.sqlze.query(q);
    } catch (error) {}
  }

  await sequelize.sync({ force });

  try {
    let found = await db.AppConfig.findOne();

    if (!found) {
      const defFolders = {
        AdultPath: "homedir/Downloads/mediaserver/R18",
        MangaPath: "homedir/Downloads/mediaserver",
        CoverPath: "homedir/images",
      };
      const appConfig = await db.AppConfig.create({ LoginTimeout: 5 });

      for (let folder of Object.keys(defFolders)) {
        fs.mkdirpSync(folder.replace("homedir", os.homedir()));
      }

      await db.user.create(
        {
          Name: "Administrator",
          Password: appConfig.AdminPassword,
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
