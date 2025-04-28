import fs from "fs-extra";
import path from "path";

import Ffmpeg from "fluent-ffmpeg";
import { exec } from "child_process";

async function getMetadata(filePath) {
  return new Promise((resolve, reject) => {
    exec(`ffprobe -v error -show_format -show_streams -print_format json "${filePath}"`, (error, stdout, stderr) => {
      if (error) {
        console.log(error);
        resolve(false);
      } else {
        try {
          resolve(JSON.parse(stdout));
        } catch (e) {
          resolve(false);
        }
      }
    });
  });
}

const convertVideo = async (vPath, isAnime) => {
  if (!fs.existsSync(vPath || "/nothing")) return;

  const files = fs.readdirSync(vPath).filter((f) => /\.(mp4|mkv)/i.test(f));
  let i = 0;

  if (!fs.existsSync(path.join(vPath, "videos"))) {
    fs.mkdirsSync(path.join(vPath, "videos"));
  }
  const padding = files.length.toString().length;

  for (let file of files) {
    await new Promise(async (resolve) => {
      const toFile = path.join(vPath, "videos", file.replace(/mkv|webm/i, "mp4"));
      const current = `${(i + 1).toString().padStart(padding, "0")}/${files.length}`;

      const filePath = path.join(vPath, file);

      const meta = await getMetadata(filePath);
      let resize = meta?.streams[0]?.width > 1280;

      Ffmpeg(filePath)
        .audioBitrate("128k")
        .videoBitrate(isAnime ? "768k" : "1024K")
        .inputOptions(["-c:v h264_qsv"])
        .outputOptions(["-movflags +faststart", resize ? "-vf scale=1280:-1" : ""])
        .on("start", (cmd) => console.log(cmd))
        .on("codecData", function (data) {
          const str = meta?.streams[0];
          console.log(`${data.duration} ~ ${str ? `${str.width}x${str.height} ~ ` : ""}${file}`);
        })
        .on("progress", (p) => {
          process.stdout.write(`\r${current} ~ ${p.timemark} ~ ${p.percent.toFixed(2)}%  `);
        })
        .saveToFile(toFile)
        .on("end", () => {
          console.log(`Save to: ${toFile}`);
          resolve(true);
          fs.removeSync(toFile);
        })
        .on("error", (err) => console.log(err));
    });

    i++;
  }
};

if (/Anime|Javs/.test(process.argv[2])) {
  const dir = process.argv[2];
  const vPath = `/mnt/Downloads/${dir}`;
  const isAnime = dir === "Anime";
  convertVideo(vPath, isAnime);
} else {
  convertVideo(process.argv[2]);
}
