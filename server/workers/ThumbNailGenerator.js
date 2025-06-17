import { join } from "path";
import { existsSync, mkdirSync, readdirSync } from "fs";
import { getVideoThumnail, ZipCover } from "./ThumbnailUtils.js";
import db from "../models/index.js";
import { getFileType } from "../Downloader/utils.js";

export const genFileThumbnails = async (folders, sendMessage) => {
  const { ImagesPath } = await db.AppConfig.findOne();

  let total = 0;
  let i = 0;

  folders.forEach((f) => (total += f.Files.length));

  for (let folder of folders) {
    if (!folder.FilesType) continue;

    sendMessage(`${parseFloat((i / (total || 1)) * 100).toFixed(2)}% - ${folder.Name}: ${folder.Files.length} files`);

    if (existsSync(folder.Path)) {
      let files = [];

      const thumbPath = join(ImagesPath, getFileType(folder), folder.Name);

      if (!existsSync(thumbPath)) {
        mkdirSync(thumbPath);
      } else {
        files = readdirSync(thumbPath);
      }

      let toUpdate = [];
      for (let file of folder.Files) {
        let Duration = 0;

        let exist = files.includes(file.Name + ".jpg");

        if (file.Duration === 0 || !exist) {
          try {
            let filePath = join(folder.Path, file.Name);

            if (!existsSync(filePath)) {
              continue;
            }

            let coverPath = join(thumbPath, file.Name + ".jpg");

            if (file.Type.includes("Manga")) {
              Duration = await ZipCover(filePath, coverPath, exist);
            } else {
              Duration = await getVideoThumnail(filePath, coverPath, exist);
            }

            if (file.Duration !== Duration) {
              toUpdate.push({ Id: file.Id, Duration });
            }
          } catch (err) {
            console.log(folder.Path, file.Name, err);
          }
        }
        i++;
      }
      await db.file.bulkCreate(toUpdate, { updateOnDuplicate: ["Duration"] });
    }
  }
  sendMessage("100% - Finish");
};

//Generate Thumbnail for folders
export const genFolderThumbnails = async (folders) => {
  for (let { filePath, coverPath } of folders) {
    try {
      if (existsSync(filePath)) {
        if (/zip/gi.test(filePath)) {
          await ZipCover(filePath, coverPath);
        } else {
          await getVideoThumnail(filePath, coverPath);
        }
      }
    } catch (err) {
      console.log(err);
    }
  }
};
