import Sequelize from "sequelize";

import config from "./config.js";
import fileModel from "./files.js";
import folderModel from "./folders.js";
import directoriesModel from "./directories.js";

const loadDb = async (DB) => {
  const DataTypes = Sequelize.DataTypes;

  const { DB_HOST, DB_USER, PASSWORD } = process.env;

  const sequelize = new Sequelize(DB, DB_USER, PASSWORD, { ...config, host: DB_HOST });

  const db = { Op: Sequelize.Op, sqlze: sequelize };

  db.file = fileModel(sequelize, DataTypes);
  db.folder = folderModel(sequelize, DataTypes);
  db.directory = directoriesModel(sequelize, DataTypes);

  db.folder.belongsTo(db.directory, { onDelete: "cascade" });
  db.directory.hasMany(db.folder);

  db.file.belongsTo(db.folder, { onDelete: "cascade" });
  db.folder.hasMany(db.file);

  db.init = async (force) => {
    await sequelize.sync({ force });
  };
  return db;
};

export default loadDb;
