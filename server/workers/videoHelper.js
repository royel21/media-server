import path from "path";
import fs from "fs-extra";
import db from "../models/index.js";
import { execSync } from "child_process";

const sendMessage = (message, event = "finish-cleaning") => {
  if (event === "finish-cleaning") {
    console.log(message);
  }
  process.send({ event, message });
};

const renameVideoFile = (src, dest, file, regex, text) => {
  try {
    const extension = "." + file.split(".").pop();

    if (/move/i.test(file)) {
      file = file.replace(/^.*. Movie|^Movie( |)/i, "Movie ");

      fs.moveSync(path.join(src, file), path.join(dest, file.trim()));
      return;
    }

    let nFile = file
      .replaceAll("_", " ")
      .replace(extension, "")
      .replace(text, "")
      .replace(".", "-")
      .replace(regex, "")
      .replace(/Season \d+ (- |)/i, "")
      .replace(/( |)\[(.*?)\]( |)|( |)\((.*?)\)( |)/g, "");

    if (/ova|especial|special/i.test(file)) {
      nFile = nFile
        .replace(/^.*.( - | )Ova /i, "Ova ")
        .replace(/^.*.( - | )Especial /i, "Especial ")
        .replace(/^.*.( - | )Special /i, "Special ")
        .trim();
    } else if (!/^\d+/.test(nFile)) {
      nFile = nFile.replace(/^.*. - /, "").trim();
    }

    const num = nFile.match(/\d+/);

    nFile += extension.toLocaleLowerCase();

    if (num && num[0]?.length < 2) {
      nFile = nFile.replace(num[0], num[0].padStart(2, "0"));
    }

    if (file !== nFile) {
      fs.moveSync(path.join(src, file), path.join(dest, nFile));
    }
  } catch (error) {
    console.log(error);
  }
};

const checkedToremove = (file) => {
  if (/\.(txt|url|html|htm|png|jpg)$/.test(file)) {
    fs.removeSync(file);
    return true;
  }

  return /\.(exe)/.test(file);
};

const vRex = /\.(mp4|mkv|avi)/;

export const workVideos = ({ folder, pass, text }) => {
  const { Name, Path } = folder;
  sendMessage(`Starting to clean up: ${Name}`);

  pass = pass ? `-p'${pass}'` : "";

  for (const file of fs.readdirSync(Path).filter((f) => /\.(exe|rar)$/.test(f))) {
    try {
      if (!/\.part1/i.test(file) && /\.part\d+/i.test(file)) {
        continue;
      }
      const filePath = path.join(Path, file);
      const result = execSync(`unrar x -y ${pass} '${filePath}' '${Path}'`);
      if (/All Ok/gi.test(result.toString())) {
        fs.removeSync(path.join(Path, file));
      }
    } catch (error) {
      if (error.toString().includes("Enter password")) {
        sendMessage({ error: `Password Error For: ${Name}` });
      }
      console.log(error.toString());
      return;
    }
  }

  const items = fs.readdirSync(Path);

  const regex = new RegExp(`${Name.replace(/ BD$| s\d+( -|)/gi, "")}( -|) `, "gi");

  for (const item of items) {
    let file = item;

    const fpath = path.join(Path, item);

    if (checkedToremove(fpath, pass)) continue;

    if (!vRex.test(item)) {
      file = fs.readdirSync(fpath).find((f) => vRex.test(f));

      if (file) {
        renameVideoFile(fpath, Path, file, regex, text);
      }
      fs.removeSync(fpath);
    } else {
      renameVideoFile(Path, Path, file, regex, text);
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

function timeout(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const moveToDir = async ({ folder, DirectoryId }) => {
  const dir = await db.directory.findOne({ where: { Id: DirectoryId } });
  const { Name } = folder;

  if (fs.existsSync(dir?.FullPath)) {
    const Path = path.join(dir.FullPath, folder.Name);

    sendMessage(`Moving: ${Name} from: ${folder.Path} -> To: ${Path}`);

    try {
      const files = fs.readdirSync(folder.Path);
      for (const file of files) {
        fs.moveSync(path.join(folder.Path, file), path.join(Path, file), { overwrite: true });
      }
      await timeout(500);

      fs.removeSync(folder.Path);

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
