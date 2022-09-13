module.exports = {
  mariadb: {
    dialect: "mariadb",
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    define: {
      charset: "utf8",
      collate: "utf8_general_ci",
      timestamps: false,
    },
    dialectOptions: {
      timezone: "Etc/GMT-4",
      multipleStatements: true,
    },
  },
  sqlite: {
    logging: false,
    dialect: "sqlite",
    storage: "mediaserver.sqlite",
    define: {
      timestamps: false,
    },
  },
};
