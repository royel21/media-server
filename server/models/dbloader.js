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

import dbconfig from "./config.js";
import { config as configEnv } from "dotenv";
configEnv();

const { HOST, HOST2, DB_USER, PASSWORD, IMAGES, IS_DEV } = process.env;

const host = IS_DEV ? HOST2 : HOST;

export const createdb = async (dbName, user, password) => {
  if (args?.length > 2) {
    const sequelize = new Sequelize("", user, password, {
      logging: console.log,
      dialect: "mariadb",
      host,
      pool: 5,
      dialectOption: {
        timezone: "Etc/GMT-4",
      },
    });
    await sequelize.query(`CREATE DATABASE if not exists ${dbName}`);
    return sequelize.close();
  }
};

export default (DB, CONNECTOR = "mariadb") => {
  const config = dbconfig[CONNECTOR];
  config.host = host;
  config.storage = DB + ".sqlite";
  //config.logging = console.log;

  const sequelize = new Sequelize(DB, DB_USER, PASSWORD, config);

  const db = {
    Op: Sequelize.Op,
    sqlze: sequelize,
    user: user(sequelize),
    file: file(sequelize, IMAGES),
    folder: folder(sequelize, IMAGES, /sqlite/i.test(CONNECTOR)),
    favorite: favorite(sequelize),
    userConfig: userConfig(sequelize),
    directory: directory(sequelize),
    favoriteFolder: favoriteFolder(sequelize),
    recentFolder: recentFolder(sequelize),
    recentFile: recentFile(sequelize),
    eventLog: eventLog(sequelize),
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
  db.user.hasOne(db.userConfig, { onDelete: "cascade" });

  db.init = async (force) => {
    await sequelize.sync({ force });

    try {
      await db.sqlze.query("ALTER TABLE Folders ADD Author VARCHAR(100) NULL;");
    } catch (error) {
      console.log("add COLUMN fail Server");
    }

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
            include: [db.favorite, db.userConfig],
            encript: true,
          }
        );
      }
    } catch (error) {}
  };

  return db;
};
