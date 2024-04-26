import os from "node:os";
import path from "node:path";
import { createDir } from "./Downloader/utils.js";

import { config } from "dotenv";
config();

const { DOWNLOAD_DIR, IMAGES_DIR, BACKUP_DIR } = process.env;
const { DB_HOST, DEV_DB_HOST, DB_USER, DB_PASSWORD, USE_DEV, DB_NAME, CONNECTOR } = process.env;
const dbName = DB_NAME || "mediaserverdb";

const defaultConfig = {
  dbConnector: /mariadb/.test(CONNECTOR) ? CONNECTOR : "sqlite",
  dbName,
  dbStorage: dbName + ".sqlite",
  dbUser: DB_USER || "root",
  dbPassword: DB_PASSWORD || "",
  dbHost: (USE_DEV ? DB_HOST : DEV_DB_HOST) || "localhost",
  DownloadDir: DOWNLOAD_DIR || path.join(os.homedir(), "rcstudio", "downloads"),
  ImagesDir: IMAGES_DIR || path.join(os.homedir(), "rcstudio", "images"),
  BackupDir: BACKUP_DIR || path.join(os.homedir(), "rcstudio", "backups"),
};

if (/mariadb/.test(CONNECTOR) && !DB_USER && !DB_PASSWORD) {
  throw "Can't use mariadb without DB_USER and DB_PASSWORD check sample-env.txt";
}

for (const key of ["DownloadDir", "ImagesDir", "BackupDir"]) {
  createDir(defaultConfig[key]);
}

export default defaultConfig;
