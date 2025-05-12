import path from "node:path";
import os from "node:os";
import fs from "fs-extra";

import Ffmpeg from "fluent-ffmpeg";
import { exec } from "node:child_process";

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

const getOptions = () => {
  const options = {
    remove: ["-r", "--remove"],
    debug: ["-d", "--debug"],
  };

  for (let op of Object.keys(options)) {
    options[op] = process.argv.find((a) => options[op].includes(a.trim()));
  }
  return options;
};

const convertVideo = async (vPath, isAnime) => {
  const options = getOptions();
  if (!fs.existsSync(vPath || "/nothing")) return;

  const files = fs.readdirSync(vPath).filter((f) => /\.(mp4|mkv|webm)/i.test(f));
  let i = 0;

  if (!fs.existsSync(path.join(vPath, "Videos"))) {
    fs.mkdirsSync(path.join(vPath, "Videos"));
  }

  const padding = files.length.toString().length;

  for (let file of files) {
    const filePath = path.join(vPath, file);

    await new Promise(async (resolve) => {
      const toFile = path.resolve(vPath, "Videos", file.replace(/mp4|webm/i, "mp4"));
      const current = `${(i + 1).toString().padStart(padding, "0")}/${files.length}`;

      const meta = await getMetadata(filePath);

      let resize = meta?.streams[0]?.width > 1280;

      const start = new Date().getTime();

      const inputOptions = [];

      const outOptions = [
        "-c:v h264",
        `-b:v ${isAnime ? "832k" : "1088k"}`,
        "-c:a aac",
        "-b:a 128k",
        "-movflags +faststart",
        "-map_chapters -1",
        // "-filter:v fps=23.976",
      ];

      if (os.platform === "linux") {
        inputOptions.unshift(`-init_hw_device vaapi=/dev/dri/renderD128`);
        inputOptions.unshift("-hwaccel_output_format qsv");
        outOptions[0] = "-c:v h264_qsv";
      }

      if (meta.streams.find((st) => st.codec_long_name?.includes("subtitle"))) {
        outOptions.push("-map 0:v");
        outOptions.push("-map 0:a");
        outOptions.push("-map 0:s");
        outOptions.push("-c:s mov_text");
      }

      if (resize) {
        outOptions.push("-vf scale=1280:-1");
      }

      const str = meta?.streams[0];
      console.log(`[${current} ~ ${getime()} ~ ${str ? `${str.width}x${str.height}` : ""} ~ ${file}]`);

      let duration = 0;

      Ffmpeg(filePath)
        .inputOptions(inputOptions)
        .outputOptions(outOptions)
        .on("start", (cmd) => {
          if (options.debug) {
            console.log(`\n${cmd}\n`);
          }
        })
        .on("codecData", function (data) {
          duration = data.duration;
        })
        .on("progress", (p) => {
          const elapse = (new Date().getTime() - start) / 1000;
          const percent = p.percent.toFixed(2);
          const text = ` ${percent}% ~ ${p.timemark}/${duration} ~ Elapse: ${formatTime(elapse)}\r`;
          process.stdout.write(text);
        })
        .saveToFile(toFile)
        .on("end", () => {
          console.log(`\n[End: ${getime()} ~ Save to: ${toFile}]\n`);
          resolve(true);
          if (options.remove) {
            fs.removeSync(filePath);
          }
        })
        .on("error", (err) => console.log(err));
    });

    i++;
  }
};

const dir = process.argv.find((a) => /Anime|Javs/.test(a));
const customPath = process.argv.slice(2).find((a) => /^(\/|[B-Z])(\/|:\\)/i.test(a));

console.log(customPath);

if (dir) {
  const vPath = `/mnt/Downloads/${dir}`;
  const isAnime = dir === "Anime";
  convertVideo(vPath, isAnime);
} else if (customPath) {
  convertVideo(customPath);
}
