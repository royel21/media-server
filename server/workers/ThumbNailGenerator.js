import { join } from "path";
import { existsSync, mkdirSync, readdirSync } from "fs";
import { getVideoThumnail, ZipCover } from "./ThumbnailUtils.js";
import db from "../models/index.js";

var thumbnailBasePath = process.env.IMAGES;

export const genFileThumbnails = async (folders, sendMessage) => {
  let total = 0;
  let i = 0;

  folders.forEach((f) => (total += f.Files.length));

  for (let folder of folders) {
    sendMessage(`${parseFloat((i / total) * 100).toFixed(2)}% - ${folder.Name}`);

    if (existsSync(folder.Path)) {
      let files = [];

      let thumbPath = join(thumbnailBasePath, folder.FilesType.includes("mangas") ? "Manga" : "Video", folder.Name);

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
  sendMessage("-----100%-----");
};

//Generate Thumbnail for folders
export const genFolderThumbnails = async (folders) => {
  for (let { filePath, CoverPath } of folders) {
    try {
      if (/zip/gi.test(filePath)) {
        await ZipCover(filePath, CoverPath);
      } else {
        await getVideoThumnail(filePath, CoverPath);
      }
    } catch (err) {
      console.log(err);
    }
  }
};
