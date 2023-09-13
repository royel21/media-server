export default {
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
    useUTC: false,
  },
};
