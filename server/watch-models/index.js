import Sequelize from "sequelize";
import Directory from "./Directory.js";
import File from "./File.js";

const DataTypes = Sequelize.DataTypes;
const sequelize = new Sequelize(null, null, null, {
  logging: false,
  dialect: "sqlite",
  storage: "server/watcher.db",
  define: {
    timestamps: false,
  },
});

export const db = {};

db.Op = Sequelize.Op;
db.sqlze = sequelize;

db.Directory = Directory(sequelize, DataTypes);
db.File = File(sequelize, DataTypes);

db.Directory.hasMany(db.File, { foreignKey: "DirectoryId", onDelete: "CASCADE", constraints: true });

db.init = async (force = false) => {
  await sequelize.sync({ force });
};

await db.init();
