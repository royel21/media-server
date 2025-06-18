import path from "path";
import fs from "fs-extra";
import winex from "win-explorer";
import { db } from "#server/watch-models/index";
import { sendMessage } from "../utils.js";

let fileTypes = ["mp4", "ogg", "zip", "mkv", "avi"];

const filterFile = (f) => {
  return !f.isDirectory && fileTypes?.includes(f.Extension.toLocaleLowerCase());
};

const AddFiles = async (files, DirectoryId) => {
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
      const { Path } = dir[0];
      if (!fs.existsSync(Path)) {
        return await sendMessage({ text: `Path: ${Path} not found`, error: true });
      }

      await sendMessage({ text: `Scanning: ${Path}` });
      await db.File.destroy({ where: { DirectoryId: dir[0].Id } });
      const files = winex.ListFilesRO(Path);
      await AddFiles(files, dir[0].Id);
      await sendMessage({ text: `Finish Scanning: ${Path}` });
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
