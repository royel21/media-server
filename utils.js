import fs from "fs-extra";

import { exec } from "child_process";
import winExplorer from "win-explorer";

async function validateMetadata(filePath) {
  return new Promise((resolve, reject) => {
    exec(`ffprobe -v error -show_format -show_streams -print_format json '${filePath}'`, (error, stdout, stderr) => {
      if (error) {
        resolve(false);
        console.log("Error parsing JSON:", error);
      } else {
        try {
          // console.log(JSON.parse(stdout));
          resolve(true);
        } catch (e) {
          console.log("Error parsing JSON:", e);
          resolve(false);
        }
      }
    });
  });
}

const list = async () => {
  const folders = winExplorer.ListFilesRO("/mnt/5TBHDD/Anime", { oneFile: false });
  let i = 0;
  for (let folder of folders) {
    console.log(`${i + 1}/${folders.size}`, folder.Name);
    for (const file of folder.Files) {
      const result = await validateMetadata(file.Path);
      if (!result) {
        console.log(file.Name, "Invalid Metadata");
      }
    }
  }
};
list();
