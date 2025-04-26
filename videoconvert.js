import fs from "fs-extra";
import path from "path";

import Ffmpeg from "fluent-ffmpeg";

const convertVideo = async (dir) => {
  const vPath = `/mnt/Downloads/${dir}`;
  const isAnime = /Anime/i.test(dir);
  const files = fs.readdirSync(vPath).filter((f) => /\.(mp4|mkv)/i.test(f));
  let i = 0;

  if (!fs.existsSync(path.join(vPath, "videos"))) {
    fs.mkdirsSync(path.join(vPath, "videos"));
  }
  const padding = files.length.toString().length;

  for (let file of files) {
    await new Promise((resolve) => {
      const toFile = path.join(vPath, "videos", file.replace(/mkv|webm/i, "mp4"));
      const current = `${(i + 1).toString().padStart(padding, "0")}/${files.length}`;

      Ffmpeg(path.join(vPath, file))
        .audioBitrate("128k")
        .videoBitrate(isAnime ? "768k" : "1024k")
        .inputOptions(["-c:v h264_qsv"])
        .outputOptions([
          "-movflags +faststart",
          `-filter:v "scale='min(1280,iw)':min'(720,ih)':force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2"`,
        ])
        .on("start", (cmd) => console.log(cmd))
        .on("codecData", function (data) {
          console.log(`${data.duration} ~ ${file}`);
        })
        .on("progress", (p) => {
          process.stdout.write(`\r${current} ~ ${p.timemark} ~ ${p.percent.toFixed(2)}%  `);
        })
        .saveToFile(toFile)
        .on("end", () => {
          console.log(`Save to: ${toFile}`);
          resolve(true);
        })
        .on("error", (err) => console.log(err));
    });

    i++;
  }
};

if (/Anime|Javs/.test(process.argv[2])) {
  convertVideo(process.argv[2]);
}
