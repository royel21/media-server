import winExplorer from "win-explorer";
import { zipImgFolder, unZip, combinedZip } from "./zipHelper.js";
import { convertVideo, extractSubVideo, fixVideo, mergeVideos } from "./videoConvert.js";
import { sendMessage } from "../utils.js";
import { homedir } from "node:os";

const state = {
  stop: false,
};

const getFilesSize = (files) => {
  let size = 0;
  for (let file of files) {
    if (file.isDirectory) {
      size += getFilesSize(file.Files);
    } else {
      size += file.Size;
    }
  }

  return size;
};

const folderSize = ({ Name, Path }) => {
  Path = Path.replace("homedir", homedir());
  const files = winExplorer.ListFilesRO(Path);
  let Size = (getFilesSize(files) / 1024 / 1024 / 1024).toFixed(2) + "GB";
  sendMessage({ Name, Path, Size }, "folder-size");
};

const actions = {
  folderSize,
  unZip,
  zipImgFolder,
  convertVideo,
  extractSubVideo,
  mergeVideos,
  fixVideo,
  combinedZip,
};

const works = {
  isWorking: false,
  pendding: [],
};

const startToWork = async () => {
  works.isWorking = true;
  while (works.pendding.length) {
    const work = works.pendding.shift();
    if (actions[work.action]) {
      const result = await actions[work.action](work.data, state);
      if (result) {
        await result();
      }
    }
  }
  await sendMessage({ isWorking: false }, "bg-worker-state");
  console.log("Finish File Work");
  state.stop = false;
  process.exit();
};

process.on("message", (work) => {
  if (work.action === "stop-video-bg") {
    return (state.stop = true);
  }

  works.pendding.push(work);
  if (!works.isWorking) startToWork();
});
