import path from "node:path";
import os from "node:os";
import fs from "fs-extra";

import Ffmpeg from "fluent-ffmpeg";
import { exec } from "node:child_process";

const sendMessage = (data, event = "files-info") => {
  console.log(data.msg || data.text || "", data.error || "");
  process.send({ event, message: data });
};

function formatTime(time) {
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

export const convertVideo = async ({ files, videoBitrate, audioBitrate, Remove, Debug }) => {
  let i = 0;

  const padding = files.length.toString().length;

  for (let file of files) {
    await new Promise(async (resolve) => {
      const basePath = file.Path.replace(/\.(mp4|webm|mkv|ogg)$/i, "");
      const toFile = basePath + `-.mp4`;
      const current = `${(i + 1).toString().padStart(padding, "0")}/${files.length}`;

      const meta = await getMetadata(file.Path);

      let resize = meta?.streams[0]?.width > 1280;

      const start = new Date().getTime();

      const inputOptions = [];

      const outOptions = [
        "-c:v h264",
        `-b:v ${videoBitrate}k`,
        "-c:a aac",
        `-b:a ${audioBitrate}k`,
        "-movflags +faststart",
        "-map_chapters -1",
      ];

      if (os.platform() === "linux") {
        inputOptions.unshift(`-init_hw_device vaapi=/dev/dri/renderD128`);
        inputOptions.unshift("-hwaccel_output_format qsv");
        outOptions[0] = "-c:v h264_qsv";
      } else {
        inputOptions.push("-hwaccel auto");
      }

      if (meta.streams.find((st) => st.codec_long_name?.includes("subtitle"))) {
        outOptions.push("-map 0:v");
        outOptions.push("-map 0:a");
        outOptions.push("-map 0:s");
        outOptions.push("-c:s mov_text");
      }

      const { pix_fmt } = meta.streams[0];

      if (pix_fmt) {
        outOptions.push(`-pix_fmt ${pix_fmt}`);
      }

      if (resize) {
        outOptions.push("-vf scale=1280:-1");
      }

      const str = meta?.streams[0];
      const info = `[${current} ~ ${getime()} ~ ${str ? `${str.width}x${str.height}` : ""} ~ ${file.Name}]`;

      let duration = 0;
      sendMessage({ text: info }, "info");
      let elapse = 0;

      Ffmpeg(file.Path)
        .inputOptions(inputOptions)
        .outputOptions(outOptions)
        .on("start", (cmd) => {
          if (Debug) {
            console.log(`\n${cmd}\n`);
          }
        })
        .on("codecData", function (data) {
          duration = data.duration.split(".")[0];
        })
        .on("progress", (p) => {
          elapse = (new Date().getTime() - start) / 1000;
          const percent = p.percent.toFixed(2);
          const text = `${percent}% ~ ${p.timemark}/${duration} ~ Elapse: ${formatTime(elapse)}\r`;
          process.stdout.write(text);
        })
        .saveToFile(toFile)
        .on("end", () => {
          console.log("\n");
          const saveInfo = `[Elapse: ${formatTime(elapse)} Duration: ${duration} ~ ${file.Name}]`;
          sendMessage({ text: saveInfo }, "info");
          console.log("\n");

          resolve(true);
          if (Remove) {
            fs.removeSync(file.Path);
          }
        })
        .on("error", (err) => resolve(true));
    });

    i++;
  }
  sendMessage({ convert: true });
};
