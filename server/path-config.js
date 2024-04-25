import os from "node:os";
import path from "node:path";

const { DOWNLOAD_DIR, IMAGES_DIR, BACKUP_DIR } = process.env;
const defaulPath = {
  DownloadDir: DOWNLOAD_DIR || path.join(os.homedir(), "Documents", "mediaserver", "downloads"),
  ImagesDir: IMAGES_DIR || path.join(os.homedir(), "Documents", "mediaserver", "images"),
  BackupDir: BACKUP_DIR || path.join(os.homedir(), "Documents", "mediaserver", "backups"),
};

export default defaulPath;
