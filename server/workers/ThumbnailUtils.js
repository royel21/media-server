import StreamZip from "node-stream-zip";
import { exec, execFileSync } from "child_process";

import sharp from "sharp";

const IMGTYPES = /\.(jpg|jpeg|png|gif|webp)$/i;

const ffmpeg = "ffmpeg";
const ffprobe = "ffprobe";

const sortByName = (a, b) => String(a.name).localeCompare(String(b.name));

export const ZipCover = async (file, coverP, exist) => {
  let zipfile;
  try {
    zipfile = new StreamZip.async({ file });

    if (!exist) {
      const entries = Object.values(await zipfile.entries())
        .sort(sortByName)
        .filter((entry) => !entry.isDirectory);

      const firstImg = entries.find((e) => IMGTYPES.test(e.name) && e.size > 1024 * 20);
      if (firstImg) {
        const buff = await zipfile.entryData(firstImg);

        let sharData = sharp(buff);

        let meta = await sharData.metadata();

        if (meta.width / meta.height < 0.6 && meta.height > 1800) {
          const height = Math.ceil(meta.width / 0.67);
          sharData = await sharData.extract({ height, width: meta.width, top: 0, left: 0 });
        }

        await sharData.jpeg().resize({ width: 240 }).toFile(coverP);
      }
    }
    const count = zipfile.entriesCount;
    await zipfile.close();
    return count;
  } catch (error) {
    console.log("thumbnail error", file, error);
    await zipfile?.close();
    return 0;
  }
};

export const getVideoDuration = async (vPath) => {
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

export const getVideoThumnail = async (video, toPath, exist) => {
  let duration = await getVideoDuration(video);

  if (!exist && duration) {
    let pos = (duration * 0.237).toFixed(2);
    let cmd = `${ffmpeg} -ss ${pos} -i "${video}" -y -vframes 1 -q:v 0 -vf scale=240:-1 "${toPath}"`;

    await new Promise((resolve) => {
      exec(cmd, (err) => {
        if (err) {
          resolve(false);
          console.log(err);
          return;
        }
        resolve(true);
      });
    });
    return duration;
  }
  return duration;
};
