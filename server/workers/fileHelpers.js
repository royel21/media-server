import fs from "fs-extra";
import path from "path";
import { capitalize } from "../Downloader/utils.js";

const sendMessage = (data, event = "files-info") => {
  console.log(data.msg || data.text || "", data.error || "");
  process.send({ event, message: data });
};

export const moveFiles = ({ files, Path, overwrite }) => {
  sendMessage({ text: `Moving Files to: ${Path} Please Wait` }, "info");

  if (!fs.existsSync(Path)) {
    return sendMessage({ error: `The specified path does not exist: ${Path}` });
  }

  for (const [i, file] of files.entries()) {
    try {
      fs.moveSync(file.Path, path.join(Path, file.Name), { overwrite });
      console.log(`${i + 1}/${files.length} Moving:`, file.Path, "->", Path);
      console.log();
      sendMessage({ text: `${i + 1}/${files.length} - ${file.Name}`, move: file }, "info");
    } catch (error) {
      sendMessage({ msg: `Error moving: ${file.Name}`, error });
    }
  }
  sendMessage({ text: `Finish Moving Files to: ${files.length}-${Path}` }, "info");
};

export const removeFiles = ({ files }) => {
  sendMessage({ msg: `Removing ${files.length} Files Please Wait` });
  let i = 0;
  for (const file of files) {
    try {
      if (fs.existsSync(file.Path)) {
        fs.removeSync(file.Path);
        sendMessage({ text: `Removing: ${i + 1}/${files.length} - ${file.Name}`, move: file }, "info");
      }
    } catch (error) {
      console.log(error);
      sendMessage({ error: `Error Removing: ${file.Name}`, err: error });
    }
    i++;
  }
  sendMessage({ msg: "Finish Removing Files", folders: files.map((f) => f.Id) });
};

const getNewId = () => {
  return "nw-" + Math.random().toString(36).slice(-5);
};

export const createFolder = ({ file, Name }) => {
  const data = { folderId: file.Id };

  if (fs.existsSync(file?.Path)) {
    const Path = path.join(file.Path, Name);

    if (fs.existsSync(Path)) {
      data.error = true;
      data.msg = `Folder: ${Name} Already Exist`;
      return sendMessage(data, "folder-create");
    }

    fs.mkdirsSync(Path);

    data.msg = `Folder: ${Name} was create`;
    data.folder = { Id: getNewId(), Name: Name, Type: "folder", Path, Content: [] };

    return sendMessage(data, "folder-create");
  }
  data.error = true;
  data.msg = `Path: ${file?.Path} was not found`;
  sendMessage(data, "folder-create");
};

//Rename local file
export const renFile = ({ file, Name }) => {
  if (fs.existsSync(file.Path)) {
    const data = { msg: "", error: "", file, Name };
    try {
      const Path = file.Path.replace(file.Name, Name);
      fs.moveSync(file.Path, file.Path.replace(file.Name, Name));
      data.msg = `File "${file.Name}" Rename to  -> "${Name}"`;
      data.file.Name = Name;
      data.file.Path = Path;
      data.ren = true;
      sendMessage(data);
    } catch (error) {
      data.msg = `Some Error Happen when trying to Rename File: ${file.Name}`;
      data.error = error;
      sendMessage(data);
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
      sendMessage({ text: `Moving: ${src}  =>  ${dest}` }, "info");

      for (const [i, file] of files.entries()) {
        if (file.startsWith(".")) continue;
        sendMessage({ text: `${i + 1}/${files.length}: ${file}` }, "info");

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

export const bulkRename = ({ files, ZeroPad, Regex, Replace, With, Case }) => {
  let regex;

  try {
    regex = new RegExp(Regex, "gi");
  } catch (error) {
    return sendMessage({ error: `Regex: ${error.toString()}` }, "info");
  }

  for (const [i, file] of files.entries()) {
    const ext = path.extname(file.Name);
    let name = file.Name.replace(ext, "");

    if (Replace) {
      name = name.replaceAll(Replace, With);
    }

    if (Regex) {
      name = name.replace(regex, "");
    }

    if (Case === "Camel") {
      name = capitalize(name);
    }

    name = name.trim();

    if (Case === "Upper") {
      name = name.toLocaleUpperCase();
    }

    if (Case === "Lower") {
      name = name.toLocaleLowerCase();
    }

    const num = name.match(/\d+/);
    if (num && num[0] && ZeroPad) {
      name = name.replace(num[0], num[0].toString().padStart(ZeroPad, "0"));
    }

    try {
      name += ext;
      const src = file.Path;
      const dest = file.Path.replace(file.Name, name);
      if (src !== dest) {
        fs.moveSync(src, dest);
        file.Name = name;
        file.Path = dest;
        files[i] = file;
      }
    } catch (error) {
      sendMessage({ text: `Can't Rename: ${file.Name}, ${error.toString()}` }, "info");
    }
  }

  sendMessage({ items: files, bulk: true }, "files-info");
};
