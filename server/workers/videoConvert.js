import path from "node:path";
import os from "node:os";
import fs from "fs-extra";

import Ffmpeg from "fluent-ffmpeg";
import { exec, execSync } from "node:child_process";

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
      let toFile = basePath + `.mp4`;
      if (fs.existsSync(toFile)) {
        toFile = toFile.replace(".mp4", "-.mp4");
      }
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

          if (Remove) {
            fs.removeSync(file.Path);
          }
          resolve(true);
        })
        .on("error", (err) => resolve(true));
    });

    i++;
  }
  sendMessage({ convert: true, msg: "Finish Converting Videos" });
};

export const mergeVideos = async ({ files }) => {
  if (files.length < 2) return sendMessage({ text: "Must Select more than one video" }, "info");
  const basePath = path.dirname(files[0].Path);
  const extension = path.extname(files[0].Name);
  const name = files[0].Name.replace(extension, "");

  const txtFiles = files.map((f) => `file '${f.Path}'`).join("\n");
  fs.writeFileSync("./files.txt", txtFiles, "utf8");
  const outFile = path.join(basePath, `${name}-merged${extension}`);

  sendMessage({ text: "Start Merging Videos" }, "info");
  await new Promise(async (resolve) => {
    exec(`ffmpeg -f concat -safe 0 -i ./files.txt -c copy "${outFile}" -y`, (error) => {
      if (error) {
        console.log(error.toString());
        sendMessage({ text: "Error Merging Videos", error: error.toString() }, "info");
        if (fs.existsSync(outFile)) {
          fs.removeSync(outFile);
        }
      } else {
        sendMessage({ convert: true, msg: `Finish Merging Video ${outFile}` });
      }
      resolve();
    });
  });
};

export const extractSubVideo = async ({ file, Start, End }) => {
  const extension = path.extname(file.Name);
  const name = file.Name.replace(extension, "");
  const basePath = path.dirname(file.Path);

  let outFile = path.join(basePath, `${name}-A${extension}`);
  let count = 0;
  let letters = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
  while (fs.existsSync(outFile)) {
    outFile = outFile.replace(`-${letters[count]}${extension}`, `-${letters[count + 1]}${extension}`);
    count++;
    if (count > letters.length) {
      return sendMessage({ text: "Can't Create More Parts", error: "Can't Create More Parts" });
    }
  }

  sendMessage({ text: `Extrating Sub Video ${file.Name} from: ${Start} ${End}` }, "info");
  console.log("Start: ", Start);
  Start = Start !== "00:00:00" ? `-ss ${Start}` : "";
  End = End !== "00:00:00" ? `-to ${End}` : "";

  await new Promise(async (resolve) => {
    console.log(`ffmpeg -i "${file.Path}" ${End} -c copy "${outFile}" -y`);
    exec(`ffmpeg ${Start} -i "${file.Path}" ${End} -c copy "${outFile}" -y`, (error) => {
      if (error) {
        console.log(error);
        sendMessage({ text: "Error Extrating Sub Video", error: error.toString() }, "info");
        if (fs.existsSync(outFile)) {
          fs.removeSync(outFile);
        }
        resolve();
      } else {
        sendMessage({ convert: true, msg: `Finish Extrated to ${outFile}` });
      }
      resolve();
    });
  });
};
