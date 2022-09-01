const path = require("path");
const fs = require("fs-extra");
const { getVideoDuration, getVideoThumnail, ZipCover } = require("./ThumbnailUtils");

var thumbnailBasePath = process.env.IMAGES;

const genFileThumbnails = async (folders) => {
  let total = 0;
  let i = 0;

  folders.forEach((f) => (total += f.Files.length));

  for (let folder of folders) {
    console.log("Folder -----", folder.Name);
    for (let file of folder.Files) {
      let Duration = 0;

      try {
        if (file.Cover.includes("\\")) await file.update({ Cover: file.Cover.replaceAll("\\", "/") });

        let filePath = path.join(folder.Path, file.Name);
        let thumbPath = path.join(thumbnailBasePath, "Manga", folder.Name);

        if (!fs.existsSync(thumbPath)) {
          fs.mkdirsSync(thumbPath);
        }

        let coverPath = path.join(thumbPath, file.Name + ".jpg");
        let exist = fs.existsSync(coverPath);

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
        console.log(folder.Pat, file.Name, err);
      }

      process.stdout.write(`-----${parseFloat((i++ / total) * 100).toFixed(2)}%-----\r`);
    }
  }
};

const genFolderThumbnails = async (folders) => {
  for (let s of folders) {
    try {
      if (s.FilesType.includes("mangas")) {
        if (/zip/gi.test(s.filePath)) {
          await ZipCover(s.filePath, s.coverPath);
        }
      } else {
        let duration = await getVideoDuration(s.filePath);
        if (isNaN(duration)) continue;
        await getVideoThumnail(s.filePath, s.coverPath, duration);
      }
    } catch (err) {
      console.log(err);
    }
  }
};

module.exports = {
  genFolderThumbnails,
  genFileThumbnails,
};
