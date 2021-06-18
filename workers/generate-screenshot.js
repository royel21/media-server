const { exec, execFileSync } = require("child_process");
const db = require("../models");
const path = require("path");
const fs = require("fs-extra");
const thumbnails = require("./thumbsnail");

var ffmpeg = "ffmpeg";
var ffprobe = "ffprobe";

var vCover = process.env.IMAGES;

const getVideoDuration = async (vPath) => {
  try {
    let tempVal = execFileSync(
      ffprobe,
      ["-i", vPath, "-show_entries", "format=duration", "-v", "quiet", "-of", "csv=p=0"],
      {
        timeout: 1000 * 60 * 10,
      }
    );
    return !isNaN(tempVal) && parseFloat(tempVal);
  } catch (err) {
    return false;
  }
};

const getScreenShot = async (video, toPath, duration) => {
  let pos = (duration * 0.237).toFixed(2);
  let cmd = ffmpeg + ` -ss ${pos} -i "${video}" -y -vframes 1 -q:v 0 -vf scale=240:-1 "${toPath}"`;
  console.time("vc");
  const result = await new Promise((resolve, reject) => {
    exec(cmd, (err, stdout, stderr) => {
      if (err) {
        resolve(false);
        console.log(err);
        return;
      }
      resolve(true);
    });
  });
  console.timeEnd("vc");
  return result;
};

module.exports.genScreenShot = async (id, isFolder) => {
  let files = [];
  if (isFolder) {
    files = await db.file.findAll({
      include: { model: db.folder, where: { Id: id }, required: true },
    });
  } else {
    files = await db.file.findAll({
      include: {
        model: db.folder,
        where: { DirectoryId: id },
        required: true,
      },
    });
  }
  console.log("Creating Thumbnails 2");
  let size = files.length;
  let progress = 0.01;
  let i = 1;
  for (let f of files) {
    try {
      let pgr = i / size;
      if (pgr > progress || i == size) {
        process.stdout.write(`\t${parseFloat(pgr * 100).toFixed(2)}% `);
        progress += 0.01;
      }
      let coverPath = path.join(vCover, f.Cover);

      let exist = fs.existsSync(coverPath);
      i++;
      if (exist && f.Duration > 0) continue;
      let fullPath = path.join(f.Folder.Path, f.Name);

      if (f.Type.includes("Manga")) {
        if (/zip/gi.test(f.Name)) {
          let total = await thumbnails.ZipCover(fullPath, coverPath, exist);
          await f.update({ Duration: total });
        } else if (/rar/gi.test(f.filePath)) {
          await thumbnails.RarCover(fullPath, coverPath);
        }
      } else {
        let Duration = await getVideoDuration(fullPath);
        if (Duration && f.Duration === 0) {
          await f.update({ Duration });
        }

        if (!exist && Duration) await getScreenShot(fullPath, coverPath, Duration);
      }
    } catch (err) {
      console.log(f.Name, err);
    }
  }
};

module.exports.foldersThumbNails = async (folders) => {
  for (let s of folders) {
    try {
      if (s.FilesType.includes("mangas")) {
        if (/zip/gi.test(s.filePath)) {
          await thumbnails.ZipCover(s.filePath, s.coverPath);
        }
      } else {
        let duration = await getVideoDuration(s.filePath);
        if (isNaN(duration)) continue;
        await getScreenShot(s.filePath, s.coverPath, duration);
      }
    } catch (err) {
      console.log(err);
    }
  }
};
