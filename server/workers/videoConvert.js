import path from "node:path";
import os from "node:os";
import fs from "fs-extra";

import Ffmpeg from "fluent-ffmpeg";
import { exec } from "node:child_process";
import { getProgress, sendMessage } from "../utils.js";

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

export const convertVideo = async (
  { files, videoBitrate, audioBitrate, Remove, Debug, Width, Height, Subtitles, Audio },
  state
) => {
  let i = 0;

  for (let file of files) {
    if (state.stop) {
      break;
    }
    await new Promise(async (resolve) => {
      const basePath = file.Path.replace(/\.(mp4|webm|mkv|ogg)$/i, "");
      let toFile = basePath + `.mp4`;
      //add - to name if mp4 file exists
      if (fs.existsSync(toFile)) {
        toFile = toFile.replace(".mp4", "-.mp4");
      }
      const current = getProgress(i + 1, files.length);

      const meta = await getMetadata(file.Path);

      let stream = meta.streams.find((s) => s.width);

      const start = new Date().getTime();

      const inputOptions = [];
      // select h264 as video output, aac audio and remove all chapter from output
      const outOptions = [
        "-c:v h264",
        `-b:v ${videoBitrate}k`,
        "-c:a aac",
        `-b:a ${audioBitrate}k`,
        "-movflags +faststart",
        "-map_chapters -1",
      ];
      // add hardware acceleration
      if (os.platform() === "linux") {
        inputOptions.unshift(`-init_hw_device vaapi=/dev/dri/renderD128`);
        inputOptions.unshift("-hwaccel_output_format qsv");
        outOptions[0] = "-c:v h264_qsv";
      } else {
        inputOptions.push("-hwaccel auto");
      }

      const getStreamIndexByLang = (list = [], type = "audio") => {
        const streams = meta.streams.filter((st) => st.codec_type === type);
        let strIndex = -1;
        if (streams.length > 0) {
          //select subtitle by order
          for (const sub of list.split("|")) {
            strIndex = streams.findIndex((st) => st.tags.language.includes(sub));
            if (strIndex > -1) break;
          }
        }

        return strIndex;
      };

      //find audio by matching language and copy to video
      let strIndex = getStreamIndexByLang(Audio, "audio");
      if (strIndex > -1) {
        outOptions.push(`-map 0:a:${strIndex}`);
      }

      //if found matching subtitle, burn it into video
      strIndex = getStreamIndexByLang(Subtitles, "subtitle");
      if (strIndex > -1) {
        const subfilepath = os.platform("win32") ? file.Path.replaceAll("\\", "/").replace(":", "\\:") : file.Path;
        outOptions.push(`-vf`);
        outOptions.push(`subtitles='${subfilepath}':si=${strIndex}`);
      }

      const { pix_fmt } = stream;
      //keep pixel format from original video
      if (pix_fmt) {
        outOptions.push(`-pix_fmt ${pix_fmt}`);
      }

      let sizeOption = `-1:-1`;
      //resize to keep under maximun width
      if (Width && stream.width > +Width) {
        sizeOption = sizeOption.replace(/^-1/, Width);
      }

      //resize to keep under maximun height
      if (Height && stream.height > +Height) {
        sizeOption = sizeOption.replace(/-1$/, Height);
      }

      if (sizeOption != "-1:-1") {
        outOptions.push(`-vf scale=${sizeOption}`);
      }

      await sendMessage({ text: `[${current} ~ ${getime()} ~ ${stream.width}x${stream.height} ~ ${file.Name}]` });

      let duration = 0;
      let elapse = 0;

      const videoProcess = Ffmpeg(file.Path)
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
          if (state.stop) {
            videoProcess.kill("SIGINT");
            return resolve();
          }

          elapse = (new Date().getTime() - start) / 1000;
          const percent = p.percent.toFixed(2);
          sendMessage({ Path: file.Path, progress: percent }, "files-info", false);

          if (Debug) {
            const text = `${percent}% ~ ${p.timemark}/${duration} ~ Elapse: ${formatTime(elapse)}\r`;
            process.stdout.write(text);
          }
        })
        .saveToFile(toFile)
        .on("end", async () => {
          console.log("\n");
          const saveInfo = `[Elapse: ${formatTime(elapse)} Duration: ${duration} ~ ${file.Name}]`;
          sendMessage({ Path: file.Path, progress: 100 }, "files-info", false);
          await sendMessage({ text: saveInfo });
          console.log("\n");

          if (Remove) {
            fs.removeSync(file.Path);
          }
          resolve(true);
        })
        .on("error", (error) => {
          error = error.toString();
          sendMessage({ text: "Error Converting video - " + error, color: "red", error }, "info", false);
          resolve(true);
        });
    });

    i++;
  }
  await sendMessage({ convert: true, msg: "Finish Converting Videos" }, "files-info");
};

export const mergeVideos = async ({ files }) => {
  if (files.length < 2) return await sendMessage({ text: "Must Select more than one video" });
  const basePath = path.dirname(files[0].Path);
  const extension = path.extname(files[0].Name);
  const name = files[0].Name.replace(extension, "");

  const txtFiles = files.map((f) => `file '${f.Path}'`).join("\n");
  fs.writeFileSync("./files.txt", txtFiles, "utf8");
  const outFile = path.join(basePath, `${name}-merged${extension}`);

  await sendMessage({ text: "Start Merging Videos" });
  await new Promise(async (resolve) => {
    exec(`ffmpeg -f concat -safe 0 -i ./files.txt -c copy "${outFile}" -y`, async (error) => {
      if (error) {
        await sendMessage({ text: "Error Merging Videos", error: error.toString() });
        if (fs.existsSync(outFile)) {
          fs.removeSync(outFile);
        }
      } else {
        await sendMessage({ convert: true, msg: `Finish Merging Video ${outFile}` }, "files-info");
      }
      resolve();
    });
  });
};

export const extractSubVideo = async ({ files, Start, End }) => {
  Start = Start !== "00:00:00" ? `-ss ${Start}` : "";
  End = End !== "00:00:00" ? `-to ${End}` : "";

  for (const file of files) {
    const extension = path.extname(file.Name);
    const name = file.Name.replace(extension, "");
    const basePath = path.dirname(file.Path);

    try {
      let outFile = path.join(basePath, `${name}-A${extension}`);
      let count = 0;
      let letters = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M"];
      while (fs.existsSync(outFile)) {
        outFile = outFile.replace(`-${letters[count]}${extension}`, `-${letters[count + 1]}${extension}`);
        count++;
        if (count > letters.length) {
          return await sendMessage({ text: "Can't Create More Parts", error: "Can't Create More Parts" }, "files-info");
        }
      }

      await sendMessage({ text: `Extrating Sub Video ${file.Name} from: ${Start} ${End}` });

      await new Promise(async (resolve) => {
        exec(`ffmpeg ${Start} -i "${file.Path}" ${End} -c copy "${outFile}" -y`, async (error) => {
          if (error) {
            console.log(error);
            await sendMessage({ text: "Error Extrating Sub Video", error: error.toString() });
            if (fs.existsSync(outFile)) {
              fs.removeSync(outFile);
            }
          } else {
          }
          resolve();
        });
      });
      const stats = fs.statSync(outFile);
      const newFile = {
        Id: Math.random().toString(36).slice(-5),
        Name: path.basename(outFile),
        Path: outFile,
        Content: [],
        Type: "file",
        Size: stats.size,
        LastModified: stats.mtime,
      };
      await sendMessage(
        { convert: true, msg: `File ${file.Name} Extrated to ${outFile}`, file: newFile },
        "files-info"
      );
    } catch (error) {
      console.loge(error);
    }
  }

  await sendMessage({ convert: true, msg: `Finish Extrating Files`, End: true }, "files-info");
};
