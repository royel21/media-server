const path = require("path");
const fs = require("fs-extra");
const { getVideoThumnail, ZipCover } = require("./ThumbnailUtils");

var thumbnailBasePath = process.env.IMAGES;

const genFileThumbnails = async (folders) => {
  let total = 0;
  let i = 0;

  folders.forEach((f) => (total += f.Files.length));

  for (let folder of folders) {
    console.log("---" + folder.Name);
    for (let file of folder.Files) {
      let Duration = 0;

      try {
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
        console.log(folder.Path, file.Name, err);
      }

      process.stdout.write(`-----${parseFloat((i++ / total) * 100).toFixed(2)}%-----\r`);
    }
  }
  console.log("-----100%-----");
};

const genFolderThumbnails = async (folders) => {
  for (let s of folders) {
    try {
      if (s.FilesType.includes("mangas")) {
        if (/zip/gi.test(s.filePath)) {
          await ZipCover(s.filePath, s.CoverPath);
        }
      } else {
        await getVideoThumnail(s.filePath, s.CoverPath, duration);
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
