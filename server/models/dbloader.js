import Sequelize from "sequelize";
import user from "./user.js";
import file from "./file.js";
import folder from "./folder.js";
import favorite from "./favorites.js";
import userConfig from "./userconfig.js";
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

import dbconfig from "./config.js";
import { config as configEnv } from "dotenv";
configEnv();

const { DB_HOST, DEV_DB_HOST, DB_USER, DB_PASSWORD, USE_DEV, DB_NAME } = process.env;

const host = USE_DEV ? DEV_DB_HOST : DB_HOST;

export const createdb = async () => {
  const sequelize = new Sequelize("", DB_USER, DB_PASSWORD, { dialect: "mariadb", host });
  await sequelize.query(`CREATE DATABASE if not exists ${DB_NAME}`);
  return sequelize.close();
};

export default (DB, CONNECTOR = "mariadb") => {
  const config = dbconfig[CONNECTOR];
  config.host = host;
  config.storage = DB + ".sqlite";
  //config.logging = console.log;

  const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, config);

  const db = {
    Op: Sequelize.Op,
    sqlze: sequelize,
    user: user(sequelize),
    file: file(sequelize),
    folder: folder(sequelize, /sqlite/i.test(CONNECTOR)),
    favorite: favorite(sequelize),
    userConfig: userConfig(sequelize),
    directory: directory(sequelize),
    favoriteFolder: favoriteFolder(sequelize),
    recentFolder: recentFolder(sequelize),
    recentFile: recentFile(sequelize),
    eventLog: eventLog(sequelize),
    Link: Links(sequelize),
    Server: Servers(sequelize),
    NameList: NameLists(sequelize),
    Exclude: Excludes(sequelize),
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

  db.Server.hasMany(db.Link, { onDelete: "CASCADE" });
  db.Link.belongsTo(db.Server, { foreignKey: "ServerId" });

  db.init = async (force) => {
    await sequelize.sync({ force });

    // try {
    //   await db.sqlze.query("ALTER TABLE Folders ADD Author VARCHAR(100) NULL;");
    // } catch (error) {
    //   console.log("add COLUMN fail Server");
    // }

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

  return db;
};
