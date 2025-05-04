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

  if (!fs.existsSync(path.join(vPath, "Videos"))) {
    fs.mkdirsSync(path.join(vPath, "Videos"));
  }
  const padding = files.length.toString().length;

  for (let file of files) {
    await new Promise(async (resolve) => {
      const toFile = path.resolve(vPath, "Videos", file.replace(/mkv|webm/i, "mp4"));
      const current = `${(i + 1).toString().padStart(padding, "0")}/${files.length}`;

      const filePath = path.join(vPath, file);

      const meta = await getMetadata(filePath);
      let resize = meta?.streams[0]?.width > 1280;

      const start = new Date().getTime();

      const inputOptions = [`-init_hw_device vaapi=/dev/dri/renderD128`, "-hwaccel_output_format qsv"];
      const outOptions = [
        "-c:v h264_qsv",
        `-b:v ${isAnime ? "832k" : "1088k"}`,
        "-c:a aac",
        "-b:a 128k",
        "-movflags +faststart",
        "-map_chapters -1"
      ];

      if(meta.streams.find(st=> st.codec_long_name?.includes("subtitle"))){
        outOptions.push("-map 0:v");
        outOptions.push("-map 0:a");
        outOptions.push("-map 0:s");
        outOptions.push("-c:s mov_text");
      }

      if (resize) {
        outOptions.push("-vf scale=1280:-1");
      }

      Ffmpeg(filePath)
        .inputOptions(inputOptions)
        .outputOptions(outOptions)
        .on("start", (cmd) => console.log(cmd))
        .on("codecData", function (data) {
          const str = meta?.streams[0];
          console.log(`${getime()} ~ ${data.duration} ~ ${str ? `${str.width}x${str.height} ~   ` : ""}${file}`);
        })
        .on("progress", (p) => {
          const elapse = (new Date().getTime() - start) / 1000;
          const percent = p.percent.toFixed(2);
          const text = `\r${current} ~ ${p.timemark} ~ ${percent}% ~ Elapse: ${formatTime(elapse)}`;
          process.stdout.write(text);
        })
        .saveToFile(toFile)
        .on("end", () => {
          console.log(`\n${getime()} Save to:  ${toFile}\n`);
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
