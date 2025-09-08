import fs from "fs-extra";
import path from "path";
import os from "os";
import { capitalize } from "#server/Downloader/utils";
import { getProgress, sendMessage } from "../utils.js";
import file from "#server/models/file";

export const moveFiles = async ({ files, Path, overwrite, NewFolder }) => {
  const originalPath = Path;
  if (/^homedir/.test(Path)) {
    Path = Path.replace("homedir", os.homedir());
  }

  if (!fs.existsSync(Path)) {
    return await sendMessage({ error: `The specified path does not exist: ${originalPath}` }, "files-info");
  }
  const count = files.length;

  const fileTxt = count > 1 ? "Files" : "File";

  await sendMessage({ text: `Moving ${count} ${fileTxt} to ${originalPath} Please Wait` });

  if (NewFolder) {
    Path = path.join(Path, NewFolder);
    fs.mkdirpSync(Path);
  }

  for (const [i, file] of files.entries()) {
    try {
      const dest = path.join(Path, file.Name);
      fs.moveSync(file.Path, dest, { overwrite });
      await sendMessage({ text: `${getProgress(i + 1, count)} - ${file.Name}`, move: file }, "info");
    } catch (error) {
      await sendMessage({ text: `Error moving: ${file.Name}`, error: error.toString() });
    }
  }
  await sendMessage({ text: `Finish Moving ${count} ${fileTxt} to ${originalPath}` });
};

export const removeFiles = async ({ files }) => {
  const count = files.length;
  await sendMessage({ msg: `Removing ${count} ${count > 1 ? "Files" : "File"} Please Wait` }, "files-info");
  let i = 0;
  for (const file of files) {
    try {
      if (fs.existsSync(file.Path)) {
        fs.removeSync(file.Path);

        await sendMessage(
          { text: `Removing ${getProgress(i + 1, count)} - ${file.Name}`, move: { Id: file.Id } },
          "info"
        );
      }
    } catch (error) {
      console.log(error);
      await sendMessage({ text: `Error Removing: ${file.Name}`, err: error.toString() });
    }
    i++;
  }
  sendMessage({ folders: files.map((f) => f.Id) }, "files-info");
  await sendMessage({ text: "Finish Removing Files" });
};

const getNewId = () => {
  return "nw-" + Math.random().toString(36).slice(-5);
};

export const createFolder = async ({ file, Name }) => {
  const data = { folderId: file.Id };

  if (fs.existsSync(file?.Path)) {
    const Path = path.join(file.Path, Name);

    if (fs.existsSync(Path)) {
      data.error = true;
      data.msg = ` ${Name} Already Exist`;
      return await sendMessage(data, "folder-create");
    }

    fs.mkdirsSync(Path);

    data.msg = `Folder ${Name} was create`;
    data.folder = { Id: getNewId(), Name: Name, Type: "folder", Path, Content: [] };

    return await sendMessage(data, "folder-create");
  }
  data.error = true;
  data.msg = `Path: ${file?.Name} was not found`;
  await sendMessage(data, "folder-create");
};

//Rename local file
export const renameFile = async ({ file, Name }) => {
  if (fs.existsSync(file.Path)) {
    const data = { msg: "", error: "", file, Name };
    try {
      const Path = file.Path.replace(file.Name, Name);
      fs.moveSync(file.Path, file.Path.replace(file.Name, Name));
      data.msg = `File ${file.Name} was rename to ${Name}`;
      data.file.Name = Name;
      data.file.Path = Path;
      data.ren = true;
      await sendMessage(data, "files-info");
    } catch (error) {
      data.msg = `File ${file.Name} Already Exist or file name no allowed`;
      data.error = error;
      await sendMessage(data, "files-info");
    }
  }
};

export const transferFiles = async (src, dest) => {
  const files = fs.readdirSync(src);
  try {
    if (!fs.existsSync(dest)) {
      fs.mkdirsSync(dest);
    }

    if (fs.existsSync(src)) {
      for (const [i, file] of files.entries()) {
        if (file.startsWith(".")) continue;
        await sendMessage({ text: `${getProgress(i + 1, files.length)} ${file}` }, "info", false);
        fs.moveSync(path.join(src, file), path.join(dest, file), { overwrite: true });
      }
      //Remove folder if empty
      if (fs.readdirSync(src).length === 0) {
        fs.removeSync(src);
      }
      return { success: true };
    }
  } catch (error) {
    console.log(error);
  }
  return { success: false };
};

export const formatName = async (
  fileName,
  {
    ZeroPad = 0,
    Regex = "",
    Replace = "",
    With = "",
    Case = "",
    PreAdd = "",
    PostAdd = "",
    Secuence = 0,
    After = "",
    Extension = "",
    Preserve = true,
  }
) => {
  let regex = "";
  Secuence = +Secuence;

  try {
    regex = new RegExp(Regex, "gi");
  } catch (error) {
    await sendMessage({ error: `Regex: ${error.toString()}` });
  }

  const ext = path.extname(fileName);
  let name = fileName.replace(ext, "");

  if (Replace) {
    const withs = With.split("|");
    const reps = Replace.split("|");
    for (const [index, rep] of Replace.split("|").entries()) {
      name = name.replaceAll(rep, withs[index] || "");
    }
  }

  if (Regex) {
    name = name.replace(regex, "");
  }

  if (Case === "Camel") {
    name = capitalize(name, " ", Preserve);
    name = capitalize(name, "-");
    name = capitalize(name, "_");
  }

  name = name.trim();

  if (Case === "Upper") {
    name = name.toLocaleUpperCase();
  }

  if (Case === "Lower") {
    name = name.toLocaleLowerCase();
  }

  if (PreAdd) {
    name = PreAdd + name;
  }
  if (PostAdd) {
    name += PostAdd;
  }

  if (Secuence) {
    const secNumber = Secuence.toString().padStart(ZeroPad, "0");
    if (After) {
      name = name.replace(After, `${After}${secNumber} `);
    } else {
      name = name + Secuence.toString().padStart(ZeroPad, "0");
    }
    Secuence++;
  }

  const num = name.match(/\d+/);
  if (ZeroPad && num && num[0]) {
    const number = +num[0];
    name = name.replace(num[0], number.toString().padStart(ZeroPad, "0"));
  }

  //format date
  const date = name.match(/\d+-\d+/);
  if (date) {
    const parts = date[0].split("-");
    if (parts[0].length === 4) {
      parts[1] = parts[1].padStart(2, "0");
      name = name.replace(date, parts.join("-"));
    }
  }

  name += Extension ? "." + Extension.replace(".", "") : ext;

  return name;
};

export const bulkRename = async (params) => {
  const { files } = params;

  for (const [i, file] of files.entries()) {
    const name = await formatName(file.Name, params);

    try {
      const src = file.Path;
      const dest = file.Path.replace(file.Name, name);
      if (src !== dest) {
        fs.moveSync(src, dest);
        await sendMessage({ text: `${file.Name} Renamed to ${name}` });
        file.Name = name;
        file.Path = dest;
        files[i] = file;
      }
    } catch (error) {
      await sendMessage({ text: `Can't Rename ${file.Name}, ${error.toString()}`, color: "red" });
    }
  }

  await sendMessage({ items: files, bulk: true }, "files-info");
};
