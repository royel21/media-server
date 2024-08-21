import StreamZip from "node-stream-zip";
import { exec, execFileSync } from "child_process";
import sharp from "sharp";

import db from "../models/index.js";
import path from "path";
import { createDir } from "../Downloader/utils.js";
import defaultConfig from "../default-config.js";

const sendMessage = (event, message) => {
  process.send({ event, message });
  console.log(event, message);
};

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
        .filter((entry) => !entry.isDirectory && IMGTYPES.test(entry.name));

      for (const entry of entries) {
        const buff = await zipfile.entryData(entry);
        try {
          let img = sharp(buff);
          const meta = await img.metadata();

          if (meta.height > 524) {
            if (meta.height > 1650) {
              img = await img.extract({
                height: 1200,
                width: meta.width,
                top: 0,
                left: 0,
              });
            }
            await img.toFormat("jpg").resize({ width: 340 }).toFile(coverP);
            await img.destroy();
            break;
          }
        } catch (error) {
          console.log("thumb-resizer", error);
        }
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
