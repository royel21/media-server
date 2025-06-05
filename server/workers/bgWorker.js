import winExplorer from "win-explorer";
import { zipImgFolder, unZip } from "./zipHelper.js";
import { convertVideo } from "./videoConvert.js";

const sendMessage = (event, message) => {
  process.send({ event, message });
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
  const files = winExplorer.ListFilesRO(Path);
  let Size = (getFilesSize(files) / 1024 / 1024 / 1024).toFixed(2) + "GB";
  sendMessage("folder-size", { Name, Path, Size });
};

const actions = {
  folderSize,
  unZip,
  zipImgFolder,
  convertVideo,
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
      const result = await actions[work.action](work.data);
      if (result) {
        await result();
      }
    }
  }
  console.log("Finish File Work");
  process.exit();
};

process.on("message", (work) => {
  works.pendding.push(work);
  if (!works.isWorking) startToWork();
});
