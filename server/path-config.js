import os from "node:os";
import path from "node:path";
import { createDir } from "./Downloader/utils.js";

const { DOWNLOAD_DIR, IMAGES_DIR, BACKUP_DIR } = process.env;
const defaulPath = {
  DownloadDir: DOWNLOAD_DIR || path.join(os.homedir(), "rcstudio", "downloads"),
  ImagesDir: IMAGES_DIR || path.join(os.homedir(), "rcstudio", "images"),
  BackupDir: BACKUP_DIR || path.join(os.homedir(), "rcstudio", "backups"),
};

for (const key in defaulPath) {
  createDir(defaulPath[key]);
}

export default defaulPath;
