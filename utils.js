import fs from "fs-extra";

import { exec } from "child_process";
import winExplorer from "win-explorer";

async function validateMetadata(filePath) {
  return new Promise((resolve, reject) => {
    exec(`ffprobe -v error -show_format -show_streams -print_format json ${filePath}`, (error, stdout, stderr) => {
      if (error) {
        resolve(false);
        console.log("Error parsing JSON:", error);
      } else {
        try {
          JSON.parse(stdout);
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
  const folders = winExplorer.ListFilesRO("/mnt/5TB/Anime", { oneFile: false });

  for (let folder of folders) {
    console.log(folder.Name);
    for (const file of folder.Files) {
      const result = await validateMetadata(file.Path);
      if (!result) {
        break;
      }
      console.log(file.Name, result);
      break;
    }
    break;
  }
};
list();
