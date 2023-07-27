import dbLoader from "./dbloader.js";

const { DB, CONNECTOR } = process.env;

const db = dbLoader(DB, CONNECTOR);

export default db;
