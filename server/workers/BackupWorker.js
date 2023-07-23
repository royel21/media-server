import { backupDb } from "./backupdb.js";
import { restoreDb } from "./restoredb.js";

const startWorker = async (event) => {
  event.type === "restore" ? restoreDb(event.date) : backupDb();
};

process.on("message", startWorker);
