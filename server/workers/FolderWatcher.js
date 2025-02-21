import path from "path";
import winex from "win-explorer";
import { db } from "../watch-models/index.js";

let fileTypes = ["mp4", "ogg", "zip", "mkv", "avi"];

export const sendMessageConsole = (message, event = "info") => {
  process.send({ event, message });
};

const filterFile = (f) => {
  return !f.isDirectory && fileTypes?.includes(f.Extension.toLocaleLowerCase());
};

const AddFiles = async (files, DirectoryId) => {
  // console.log("files: ", files.length);

  if (files.length) {
    const Files = files.filter(filterFile).map((f) => ({ ...f, DirectoryId }));

    if (Files.length) {
      try {
        //if folder contain require file create folder and file in the db
        await db.File.bulkCreate(Files);
      } catch (error) {
        console.log(error, Files);
      }
    }
    // if folder contain folders scan recursive
    for (const folder of files.filter((f) => f.isDirectory)) {
      await AddFiles(folder.Files, DirectoryId);
    }
  }
};

export const dirScan = async ({ Path }) => {
  try {
    await db.init();
    let dir = await db.Directory.findOrCreate({ where: { Name: path.basename(Path), Path } });
    if (dir[0]) {
      sendMessageConsole({ text: `Scanning: ${dir[0].Path}` });
      await db.File.destroy({ where: { DirectoryId: dir[0].Id } });
      const files = winex.ListFilesRO(dir[0].Path);
      await AddFiles(files, dir[0].Id);
      sendMessageConsole({ text: `Finish Scanning: ${dir[0].Path}` });
    }
  } catch (error) {
    console.log(error);
  }
};

export const removeWatchDir = async (Id) => {
  try {
    await db.Directory.destroy({ where: { Id } });
  } catch (error) {
    console.log(error);
  }
};
