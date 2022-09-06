const Sequelize = require("sequelize");

const DataTypes = Sequelize.DataTypes;

const { USERNAME, HOST, HOST2, DB_USER, PASSWORD, DB } = process.env;

const config = require("./config");
config.host = USERNAME === "rconsoro" ? HOST : HOST2;
// config.logging = console.log;

const sequelize = new Sequelize(DB, DB_USER, PASSWORD, config);

const db = { Op: Sequelize.Op, sqlze: sequelize };

db.user = require("./user")(sequelize, DataTypes);
db.file = require("./file")(sequelize, DataTypes);
db.category = require("./category")(sequelize, DataTypes);
db.folder = require("./folder")(sequelize, DataTypes);
db.favorite = require("./favorites")(sequelize, DataTypes);
db.recent = require("./recents")(sequelize, DataTypes);
db.userConfig = require("./userconfig")(sequelize, DataTypes);
db.directory = require("./directories")(sequelize, DataTypes);

db.recentFile = require("./recent-file")(sequelize, DataTypes);
db.recentFolder = require("./recent-folder")(sequelize, DataTypes);
db.favoriteFolder = require("./favorite-folder")(sequelize, DataTypes);
db.folderCategory = require("./folder-category")(sequelize, DataTypes);

db.category.belongsToMany(db.folder, { through: { model: db.folderCategory } });

db.folder.belongsToMany(db.category, {
  through: { model: db.folderCategory, onDelete: "cascade" },
});

db.favorite.belongsToMany(db.folder, { through: { model: db.favoriteFolder } });
db.folder.belongsToMany(db.favorite, {
  through: { model: db.favoriteFolder, onDelete: "cascade" },
});

db.recent.belongsToMany(db.folder, { through: { model: db.recentFolder } });
db.folder.belongsToMany(db.recent, {
  through: { model: db.recentFolder, onDelete: "cascade" },
});

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
      }
    );
  }
};

module.exports = db;
