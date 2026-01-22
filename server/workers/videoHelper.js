import path from "path";
import fs from "fs-extra";
import { execSync } from "child_process";
import { sendMessage } from "../utils.js";
import { delay } from "#server/Downloader/utils";
import os from "os";

const homedir = os.homedir();

let count = 0;

const renameVideoFile = (src, dest, file, regex, text, padding) => {
  if (!/\d+|movie|ova|ending|opening|(e|)special/.test(file)) {
    return;
  }

  count++;
  const nextNum = count.toString().padStart(padding, "0");
  try {
    const extension = "." + file.split(".").pop();

    if (/movie/i.test(file)) {
      file = file.replace(/^.*. Movie|^Movie( |)/i, "Movie ");

      fs.moveSync(path.join(src, file), path.join(dest, file.trim()));
      return;
    }

    let nFile = file
      .replace(extension, "")
      .replace(text, "")
      .replaceAll("_", " ")
      .replace(".", "-")
      .replace(regex, "")
      .replace(/\d+[a-z]+ Season |Season \d+[a-z]+ (- |)|episodio |capitulo /gi, "")
      .replace(/(( )+|)((\[|\()(.*?)(\]|\)))(( )+|)/g, "");

    if (/ending|opening|ova|(e|)special|Extra/i.test(file)) {
      nFile = nFile
        .replace(/^.*.( - | )Ova( |)/i, "Ova ")
        .replace(/^.*.( - | )Especial( |)/i, "Especial ")
        .replace(/^.*.( - | )Special( |)/i, "Special ")
        .replace(/^.*.( - | )Extra( |)/i, "Special ")
        .trim();
    } else if (!/^\d+/.test(nFile)) {
      nFile = nFile.replace(/([\w-]*[^\d]+)|([\w-]*(- |))/, "").trim();
    }

    const num = nFile.match(/\d+/);

    if (num && num[0]?.length < +padding) {
      nFile = nFile.replace(num[0], num[0].padStart(+padding || 2, "0"));
    }

    nFile = nFile.replace(/\d+nd Season - /, "");
    if (!/\d+/.test(nFile) && !/ending|opening|ova|(e|)special|extra|Movie/i.test(nFile)) {
      if (/Ending|Opening/i.test(file)) {
        const parts = file.match(/(Ending|Opening)( \d+|)/i);
        if (parts[0] && /\d+/.test(parts[0])) {
          nFile = parts[0];
        } else {
          nFile = `${parts[0]} - ${nextNum}`;
        }
      } else {
        nFile = `${nextNum} - ${nFile}`;
      }
    }

    nFile += extension.toLocaleLowerCase();

    if (path.join(src, file) !== path.join(dest, nFile)) {
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

export const workVideos = async ({ folder, pass, text, padding }) => {
  count = 0;
  const { Name, Path } = folder;
  await sendMessage({ msg: `Starting to clean up: ${Name}` }, "finish-cleaning");

  pass = pass ? `-p'${pass}'` : "";

  for (const file of fs.readdirSync(Path).filter((f) => /\.(exe|rar|zip)$/.test(f))) {
    try {
      if (!/\.part1$/i.test(file) && /\.part\d+$/i.test(file)) {
        continue;
      }

      const filePath = path.join(Path, file);
      let result;
      if (/\.zip$/.test(file)) {
        result = execSync(`unzip '${filePath}' '-d ${Path}'`);
      } else {
        result = execSync(`unrar x -y ${pass} '${filePath}' '${Path}'`);
      }
      if (/All Ok/gi.test(result.toString())) {
        fs.removeSync(path.join(Path, file));
      }
    } catch (error) {
      if (error.toString().includes("Enter password")) {
        await sendMessage({ error: true, msg: `Wrong Password For: ${Name}` }, "finish-cleaning");
      }
      console.log(error.toString());
      return;
    }
  }

  const items = fs.readdirSync(Path);

  const regex = new RegExp(`${Name.replace(/ BD$| s\d+( -|)/gi, "")}( -|) `, "gi");

  for (const item of items) {
    let file = item;

    if (/\.part$/i.test(file)) {
      continue;
    }

    const fpath = path.join(Path, item);

    if (checkedToremove(fpath, pass)) continue;

    if (!vRex.test(item)) {
      file = fs.readdirSync(fpath).find((f) => vRex.test(f));

      if (file) {
        renameVideoFile(fpath, Path, file, regex, text, padding);
      }
      fs.removeSync(fpath);
    } else {
      renameVideoFile(Path, Path, file, regex, text, padding);
    }
  }

  await sendMessage({ msg: `Finish Cleaning: ${Name}` }, "finish-cleaning");
};

export const removeDFolder = async ({ Id, Name, Path }) => {
  if (Path.includes("homedir")) {
    Path = Path.replace("homedir", homedir);
  }

  if (fs.existsSync(Path)) {
    try {
      fs.removeSync(Path);
      await sendMessage({ msg: `Finish Removing "${Path}"`, folder: { Id } }, "folder-remove");
    } catch (error) {
      await sendMessage(
        { error: error.toString(), msg: `Error Removing "${Path}"`, folder: { Id, Name, Path } },
        "folder-remove",
      );
    }
  } else {
    await sendMessage(
      { error: true, msg: `Path "${Path.replace(homedir, "homedir")}" doesn't exist`, folder: { Id } },
      "folder-remove",
    );
  }
};

export const renameFolder = async ({ folder, Name }) => {
  if (fs.existsSync(folder.Path)) {
    const data = { msg: "", error: "", folder, Name };
    try {
      fs.moveSync(folder.Path, folder.Path.replace(folder.Name, Name));
      data.msg = `Folder ${folder.Name} was rename to ${Name}`;
      await sendMessage(data, "folder-rename");
    } catch (error) {
      data.msg = `Some Error Happen when trying to move Folder ${folder.Name}`;
      data.error = error;
      await sendMessage(data, "folder-rename");
    }
  }
};
