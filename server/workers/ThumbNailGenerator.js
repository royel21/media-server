import { join } from "path";
import { existsSync } from "fs";
import { getVideoThumnail, ZipCover } from "./ThumbnailUtils.js";

var thumbnailBasePath = process.env.IMAGES;

export const genFileThumbnails = async (folders) => {
  let total = 0;
  let i = 0;

  folders.forEach((f) => (total += f.Files.length));

  for (let folder of folders) {
    console.log("---" + folder.Name);
    process.send({
      event: "info",
      text: `${parseFloat((i++ / total) * 100).toFixed(2)}% - ${folder.Name}`,
    });
    for (let file of folder.Files) {
      let Duration = 0;

      try {
        let filePath = join(folder.Path, file.Name);
        let thumbPath = join(thumbnailBasePath, file.Type, folder.Name);

        if (!existsSync(thumbPath)) {
          mkdirsSync(thumbPath);
        }

        let coverPath = join(thumbPath, file.Name + ".jpg");
        let exist = existsSync(coverPath);

        if (file.Duration === 0 || !exist) {
          if (file.Type.includes("Manga")) {
            Duration = await ZipCover(filePath, coverPath, exist);
          } else {
            Duration = await getVideoThumnail(filePath, coverPath, exist);
          }

          if (file.Duration !== Duration) {
            await file.update({ Duration });
          }
        }
      } catch (err) {
        console.log(folder.Path, file.Name, err);
      }

      process.stdout.write(`-----${parseFloat((i++ / total) * 100).toFixed(2)}%-----\r`);
    }
  }
  console.log("-----100%-----");
  process.send({ event: "info", text: "-----100%-----" });
};

export const genFolderThumbnails = async (folders) => {
  for (let s of folders) {
    try {
      if (s.FilesType.includes("mangas")) {
        if (/zip/gi.test(s.filePath)) {
          await ZipCover(s.filePath, s.CoverPath);
        }
      } else {
        await getVideoThumnail(s.filePath, s.CoverPath);
      }
    } catch (err) {
      console.log(err);
    }
  }
};
