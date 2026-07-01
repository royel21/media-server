export default {
  mariadb: {
    dialect: "mariadb",
    logging: false,
    pool: {
      max: 10,
      min: 2,
    },
    define: {
      charset: "utf8mb4",
      collate: "utf8mb4_unicode_ci",
      timestamps: false,
    },
    dialectOptions: {
      useUTC: false,
    },
    timezone: "-04:00",
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
