import path from "path";
import fs from "fs-extra";
import db from "../models/index.js";

const sendMessage = (message, event = "finish-cleaning") => {
  console.log(message);
  process.send({ event, message });
};

const renameVideoFile = (src, dest, file, regex) => {
  if (/movie/gi.test(file)) return;

  try {
    fs.moveSync(path.join(src, file), path.join(dest, file.replace(regex, "")));
  } catch (error) {}
};

const checkedToremove = (file) => {
  if (/\.(txt|url|html|htm|png|jpg)$/.test(file)) {
    fs.removeSync(file);
    return true;
  }

  return /\.(exe)/.test(file);
};

const vRex = /\.(mp4|mkv|avi)/;

export const workVideos = ({ Name, Path }) => {
  sendMessage(`Starting to clean up: ${Name}`);

  const items = fs.readdirSync(Path);

  const regex = new RegExp(`( |)\\[(.*?)\\]( |)|${Name.replace(/ BD$| s\d+( -|)/gi, "")}( -|) `, "gi");

  for (const item of items) {
    let file = item;

    const fpath = path.join(Path, item);

    if (checkedToremove(fpath)) continue;

    if (!vRex.test(item)) {
      file = fs.readdirSync(fpath).find((f) => vRex.test(f));

      if (file) {
        renameVideoFile(fpath, Path, file, regex);
      }
      fs.removeSync(fpath);
    } else {
      renameVideoFile(Path, Path, file, regex);
    }
  }

  sendMessage(`Finish Cleaning: ${Name}`);
};

export const removeDFolder = ({ Name, Path }) => {
  if (fs.existsSync(Path)) {
    try {
      sendMessage(`Removing: ${Name}`);
      fs.removeSync(Path);
      sendMessage(`Finish Removing: ${Name}`);
    } catch (error) {
      console.log(error);
    }
  }
};

export const moveToDir = async ({ folder, DirectoryId }) => {
  const dir = await db.directory.findOne({ where: { Id: DirectoryId } });
  const { Name } = folder;

  if (fs.existsSync(dir?.FullPath)) {
    const Path = path.join(dir.FullPath, folder.Name);

    sendMessage(`Moving: ${Name} from: ${folder.Path} -> To: ${Path}`);

    try {
      fs.moveSync(folder.Path, Path, { overwrite: true });
      const FileCount = fs.readdirSync(Path).filter((f) => vRex.test(f)).length;
      let found = await db.folder.findOne({ where: { Name, DirectoryId } });

      if (found) {
        found.update({ FileCount, CreatedAt: new Date() });
      } else {
        found = await db.folder.create({
          Name,
          DirectoryId,
          FilesType: "videos",
          FileCount,
          Path,
          CreatedAt: new Date(),
        });
      }
      sendMessage({ folder, FolderId: found.Id }, "folder-move");
    } catch (error) {
      console.log(error);
      sendMessage(
        {
          error: error.toString(),
          msg: `Some Error Happen when trying to move Folder: ${folder.Name}`,
        },
        "folder-move"
      );
    }
  }
};

export const remFolder = ({ folder, Name }) => {
  if (fs.existsSync(folder.Path)) {
    try {
      fs.moveSync(folder.Path, folder.Path.replace(folder.Name, Name));
      sendMessage(`Folder: ${folder.Name} -> Rename to: ${Name}`);
    } catch (error) {
      sendMessage(
        {
          error: error.toString(),
          msg: `Some Error Happen when trying to move Folder: ${folder.Name}`,
        },
        "folder-move"
      );
    }
  }
};
