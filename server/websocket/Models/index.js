import Sequelize from "sequelize";

import Links from "./Links.js";
import Servers from "./Servers.js";
import NameLists from "./NameLists.js";
import Excludes from "./Excludes.js";

const DataTypes = Sequelize.DataTypes;

const { DM_USER, DM_PASS, DB_HOST, DB_HOST_DEV, IS_DEV } = process.env;

import config from "./config.js";

config.host = IS_DEV ? DB_HOST_DEV : DB_HOST;
console.log(IS_DEV, DB_HOST_DEV);

const sequelize = new Sequelize("mangadownloader", DM_USER, DM_PASS, config);

const db = {};

db.Op = Sequelize.Op;
db.sqlze = sequelize;

db.Link = Links(sequelize, DataTypes);
db.Server = Servers(sequelize, DataTypes);
db.NameList = NameLists(sequelize, DataTypes);
db.Exclude = Excludes(sequelize, DataTypes);

db.Server.hasMany(db.Link, { onDelete: "CASCADE" });
db.Link.belongsTo(db.Server, { foreignKey: "ServerId" });

db.init = async (force = false) => {
  try {
    await db.sqlze.query("ALTER TABLE Servers ADD Enable BOOLEAN NOT NULL DEFAULT False;");
  } catch (error) {}

  await sequelize.sync({ force });
};

export default db;
