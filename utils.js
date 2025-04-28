import fs from "fs-extra";

import { exec } from "child_process";
import winExplorer from "win-explorer";

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

const list = async () => {
  ///mnt/5TBHDD/Anime
  const folders = winExplorer.ListFilesRO("D:/temp", { oneFile: false });
  let i = 0;
  const invalidFiles = {};
  for (let folder of folders) {
    console.log(`${i + 1}/${folders.length}`, folder.Name);
    for (const file of folder.Files) {
      if (!file.isDirectory) {
        const result = await getMetadata(file.Path);
        if (!result) {
          if (!invalidFiles[folder.Name]) invalidFiles[folder.Name] = [];
          invalidFiles[folder.Name].push(file.Name);
          console.log(file.Path);
        }
      }
    }
    i++;
  }
  fs.writeJSONSync("invalidFiles.json", invalidFiles);

  process.exit();
};
list();
