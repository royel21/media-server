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
// list();

export const isChar = (c) => {
  return c.match(/[a-z]/i);
};

const capitalize = (val) => {
  let words = val.split(" ");
  for (let i = 0; i < words.length; i++) {
    let word = words[i].toLowerCase();

    const index = word.split("").findIndex((c) => /[a-z]/i.test(c));
    if (index > -1) {
      words[i] = word.slice(index, index + 1).toUpperCase() + word.slice(index + 1).toLowerCase();
    }
  }
  return words.join(" ");
};

// const nameFormat = (name) => {
//   name = capitalize(name);
//   name = name.replace(/vol.( |)+/gi, "Vol.");
//   if (/Comic /gi.test(name)) {
//     let num = name.match(/\d+/);
//     if (num) {
//       name = name.replace(num, num.toString().padStart(3, "0"));
//     }
//   }
//   return name.trim();
// };

console.log(capitalize("COMIC BAVEL 2021-09"));
