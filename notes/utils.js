// ffmpeg -loglevel panic -y -i "MMPB-080.mp4" -frames 1 -q:v 1 -vf "select=not(mod(n\,120)),scale=-1:120,tile=4x4" MMPB-080.jpg

// ffmpeg -i MMPB-080.mp4 -fps_mode vfr -y -vf "select='isnan(prev_selected_t)+gte(t-prev_selected_t,2)',scale=160:90,tile=7x7" MMPB-080.jpg

// ffmpeg -i MMPB-080.mp4 -vf -y select='gt(scene\,0.4)',scale=160:120,tile -frames:v 1 MMPB-080.jpg

// total_frames=$(ffprobe -v error -count_frames -select_streams v:0 -show_entries stream=nb_read_frames -of default=nokey=1:noprint_wrappers=1 input.mp4)

// # Calculate the number of rows needed
// columns=10
// rows=$(( (total_frames + columns - 1) / columns ))

// # Generate the tiled image
// ffmpeg -i input.mp4 -vf "fps=1,scale=90:45,tile=${columns}x${rows}" -an -vsync 0 output.png

import { exec, execSync } from "child_process";

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

const getScreen = async (video) => {
  const meta = await getMetadata(video);
  console.log(meta.streams[0]);
  const vsteam = meta.streams[0];

  const duration = vsteam.duration;
  console.log(duration / 16);

  const interval = parseInt(duration / 16);

  const image = video.replace(/\.(mp4|mkv)/i, "");

  const result = execSync(`ffmpeg -i "${video}" -vf "fps=1/${interval},tile=3x3" ${image}.jpg -y`);
  console.log("finish");
};
getScreen("/mnt/Downloads/Javs/Videos/MMPB-080.mp4");
