const StreamZip = require("node-stream-zip");
const { exec, execFileSync } = require("child_process");
const path = require("path");

const sharp = require("sharp");

const IMGTYPES = /jpg|jpeg|png|gif|webp/i;

var ffmpeg = "ffmpeg";
var ffprobe = "ffprobe";

const ZipCover = async (file, coverP, exist) => {
  try {
    const zipfile = new StreamZip.async({ file });

    const entries = Object.values(await zipfile.entries())
      .sort((a, b) => String(a.name).localeCompare(String(b.name)))
      .filter((entry) => !entry.isDirectory);

    if (!exist) {
      const firstImg = entries.find((e) => IMGTYPES.test(e.name.split(".").pop()) && e.size > 1024 * 30);
      if (firstImg) {
        const buff = await zipfile.entryData(firstImg);

        let sharData = sharp(buff);

        let meta = await sharData.metadata();

        if (meta.height > 1650) {
          sharData = await sharData.extract({ height: 1200, width: meta.width, top: 0, left: 0 });
        }

        await sharData.jpeg({ quality: 75 }).resize(240).toFile(coverP);
      }
    }

    await zipfile.close();
    return entries.length;
  } catch (error) {
    console.log("thumbnail error", path.basename(file), error);
    return 0;
  }
};

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
    return 0;
  }
};

const getVideoThumnail = async (video, toPath, exist) => {
  let duration = getVideoDuration(video);

  if (!exist && duration) {
    let pos = (duration * 0.237).toFixed(2);
    let cmd = ffmpeg + ` -ss ${pos} -i "${video}" -y -vframes 1 -q:v 0 -vf scale=240:-1 "${toPath}"`;

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
    return result;
  }
  return duration;
};

module.exports = {
  getVideoDuration,
  getVideoThumnail,
  ZipCover,
};
