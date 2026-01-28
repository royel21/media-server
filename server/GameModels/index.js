import Sequelize from "sequelize";

import Directory from "./Directory.js";
import Games from "./Games.js";
import Info from "./Info.js";

const DataTypes = Sequelize.DataTypes;
const sequelize = new Sequelize(null, null, null, {
  logging: false,
  dialect: "sqlite",
  storage: "server/gamelist.db",
  define: {
    timestamps: false,
  },
});

export const db = {};

db.Op = Sequelize.Op;
db.sqlze = sequelize;

db.Directory = Directory(sequelize, DataTypes);
db.Game = Games(sequelize, DataTypes);
db.Info = Info(sequelize, DataTypes);

db.Directory.hasMany(db.Game, { foreignKey: "DirectoryId", onDelete: "CASCADE" });

db.Game.hasOne(db.Info, {
  foreignKey: "Codes",
  constraints: false,
});

db.Info.belongsTo(db.Game, { foreignKey: "Codes", targetKey: "Codes", constraints: false });

db.init = async (force) => {
  try {
    await db.sqlze.query("ALTER TABLE Infos ADD Genres VARCHAR(100) NULL DEFAULT '';");
  } catch (error) {}
  await sequelize.sync({ force });
};

db.init();
