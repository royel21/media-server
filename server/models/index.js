import Sequelize from "sequelize";
import user from "./user.js";
import file from "./file.js";
import folder from "./folder.js";
import favorite from "./favorites.js";
import recent from "./recents.js";
import userConfig from "./userconfig.js";
import directory from "./directories.js";
import favoriteFolder from "./favorite-folder.js";
import recentFolder from "./recent-folder.js";
import recentFile from "./recent-file.js";

import dbconfig from "./config.js";
import { config as configEnv } from "dotenv";
configEnv();

const DataTypes = Sequelize.DataTypes;

const { USERNAME, HOST, HOST2, DB_USER, PASSWORD, DB, CONNECTOR, IMAGES } = process.env;

const config = dbconfig[CONNECTOR];
config.host = USERNAME === "rconsoro" ? HOST : HOST2;
//config.logging = console.log;

const sequelize = new Sequelize(DB, DB_USER, PASSWORD, config);

const db = {
  Op: Sequelize.Op,
  sqlze: sequelize,
  user: user(sequelize, DataTypes),
  file: file(sequelize, DataTypes, IMAGES),
  folder: folder(sequelize, DataTypes, IMAGES),
  favorite: favorite(sequelize, DataTypes),
  recent: recent(sequelize, DataTypes),
  userConfig: userConfig(sequelize, DataTypes),
  directory: directory(sequelize, DataTypes),
  favoriteFolder: favoriteFolder(sequelize, DataTypes),
  recentFolder: recentFolder(sequelize, DataTypes),
  recentFile: recentFile(sequelize, DataTypes),
};

db.favorite.belongsToMany(db.folder, { through: { model: db.favoriteFolder } });

db.folder.belongsToMany(db.favorite, {
  through: { model: db.favoriteFolder, onDelete: "cascade" },
});

db.user.hasMany(db.recentFolder, { onDelete: "cascade" });
db.user.hasMany(db.recentFile, { onDelete: "cascade" });

db.folder.hasOne(db.recentFolder);

db.recent.belongsToMany(db.file, { through: { model: db.recentFile } });
db.file.belongsToMany(db.recent, {
  through: { model: db.recentFile, onDelete: "cascade" },
});

db.folder.belongsTo(db.directory, { onDelete: "cascade" });
db.directory.hasMany(db.folder);

db.file.belongsTo(db.folder, { onDelete: "cascade" });
db.folder.hasMany(db.file);

db.user.hasMany(db.favorite, { onDelete: "cascade" });
db.user.hasOne(db.recent, { onDelete: "cascade" });
db.user.hasOne(db.userConfig, { onDelete: "cascade" });

db.init = async (force) => {
  await sequelize.sync({ force });

  try {
    await db.sqlze.query("ALTER TABLE Folders ADD Scanning TINYINT(1) NULL DEFAULT '0';");
  } catch (error) {
    console.log("add COLUMN fail Server");
  }

  let admin = await db.user.findOne({ where: { Name: "Administrator" } });

  if (!admin) {
    await db.user.create(
      {
        Name: "Administrator",
        Password: "Admin",
        Role: "Administrator",
        Recent: {
          Name: "Administrator",
        },
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
        include: [db.recent, db.favorite, db.userConfig],
        encript: true,
      }
    );
  }
};

export default db;
