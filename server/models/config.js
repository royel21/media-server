export default {
  mariadb: {
    dialect: "mariadb",
    logging: false,
    pool: {
      max: 10,
      min: 2,
    },
    define: {
      charset: "utf8",
      collate: "utf8_general_ci",
      timestamps: false,
    },
    dialectOptions: {
      useUTC: false,
    },
  },
  sqlite: {
    logging: false,
    dialect: "sqlite",
    define: {
      timestamps: false,
    },
    dialectOptions: {
      useUTC: false,
    },
  },
};
