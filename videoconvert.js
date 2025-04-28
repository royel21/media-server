import fs from "fs-extra";
import path from "path";

import Ffmpeg from "fluent-ffmpeg";
import { exec } from "child_process";

export function formatTime(time) {
  if (time === 0) return "00:00";

  let h = Math.floor(time / 3600);
  let min = Math.floor((time / 3600 - h) * 60);
  let sec = Math.floor(time % 60);
  return (h === 0 ? "" : h + ":") + String(min).padStart(2, "0") + ":" + String(sec).padStart(2, "0");
}

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

const getime = () => new Date().toLocaleTimeString();

const convertVideo = async (vPath, isAnime) => {
  if (!fs.existsSync(vPath || "/nothing")) return;

  const files = fs.readdirSync(vPath).filter((f) => /\.(mp4|mkv)/i.test(f));
  let i = 0;

  if (!fs.existsSync(path.join("../", "Videos"))) {
    fs.mkdirsSync(path.join("../", "Videos"));
  }
  const padding = files.length.toString().length;

  for (let file of files) {
    await new Promise(async (resolve) => {
      const toFile = path.resolve("../", "Videos", file.replace(/mkv|webm/i, "mp4"));
      const current = `${(i + 1).toString().padStart(padding, "0")}/${files.length}`;

      const filePath = path.join(vPath, file);

      const meta = await getMetadata(filePath);
      let resize = meta?.streams[0]?.width > 1280;

      const start = new Date().getTime();

      Ffmpeg(filePath)
        .audioBitrate("128k")
        .videoBitrate(isAnime ? "768k" : "1152k")
        .inputOptions(["-c:v h264_qsv"])
        .outputOptions(["-movflags +faststart", resize ? "-vf scale=1280:-1" : ""])
        .on("start", (cmd) => console.log(cmd))
        .on("codecData", function (data) {
          const str = meta?.streams[0];
          console.log(`${getime()} ~ ${data.duration} ~ ${str ? `${str.width}x${str.height} ~   ` : ""}${file}`);
        })
        .on("progress", (p) => {
          const elapse = (new Date().getTime() - start) / 1000;
          const percent = p.percent.toFixed(2);
          process.stdout.write(`\r${current} ~ ${p.timemark} ~ ${percent}% ~ Elapse: ${formatTime(elapse)}`);
        })
        .saveToFile(toFile)
        .on("end", () => {
          console.log(`${getime()} Save to:  ${toFile}\n`);
          resolve(true);
          // fs.removeSync(toFile);
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
