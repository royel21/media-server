import path from "path";
import winex from "win-explorer";
import { db } from "../watch-models/index.js";

let fileTypes = ["mp4", "ogg", "zip", "mkv", "avi"];

const filterFile = (f) => {
  return !f.isDirectory && fileTypes?.includes(f.Extension.toLocaleLowerCase());
};

const AddFiles = async (files, DirectoryId) => {
  console.log("files: ", files.length);
  const mapFile = (file) => {
    file.Dir = path.dirname(file.Path);
    return { ...file, DirectoryId };
  };

  if (files.length) {
    const Files = files.filter(filterFile).map(mapFile);

    try {
      //if folder contain require file create folder and file in the db
      if (Files.length) {
        await db.File.bulkCreate(Files);
      }
    } catch (error) {
      console.log(error);
    }
    // if folder contain folders scan recursive
    for (const folder of files.filter((f) => f.isDirectory)) {
      const fileList = winex.ListFiles(folder.Path);
      await AddFiles(fileList, DirectoryId);
    }
  }
};

export const dirScan = async ({ Path }) => {
  try {
    await db.init();
    let dir = await db.Directory.findOrCreate({ where: { Name: path.basename(Path), Path } });
    if (dir[0]) {
      await db.File.destroy({ where: { DirectoryId: dir[0].Id } });
      const files = winex.ListFiles(dir[0].Path);
      await AddFiles(files, dir[0].Id);
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
