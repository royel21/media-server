module.exports = {
    HOST: "localhost",
    USER: "MediaServer8427",
    PASSWORD: "Nuc842764",
    DB: "MediaServerDB",
    dialect: "mariadb",
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
    },
};
