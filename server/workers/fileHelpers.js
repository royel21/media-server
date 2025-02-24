import fs from "fs-extra";
import path from "path";
import defaultConfig from "../default-config.js";

const sendMessage = (data, event = "files-info") => {
  console.log(data.msg || "", data.error || "");
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
      sendMessage({ text: `File: ${i + 1}/${files.length} - ${file.Name}`, move: file }, "info");
    } catch (error) {
      sendMessage({ msg: `Error moving: ${file.Name}`, error });
    }
  }
  sendMessage({ text: `Finish Moving Files to: ${Path}` }, "info");
};

export const removeFiles = ({ files }) => {
  sendMessage({ msg: `Removing ${files.length} Files Please Wait` });
  for (const file of files) {
    try {
      if (fs.existsSync(file.Path)) {
        fs.removeSync(file.Path);
      }
    } catch (error) {
      sendMessage({ error: `Error Removing: ${file.Name}`, err: error });
    }
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

const getFileType = ({ FilesType }) => (FilesType === "mangas" ? "Manga" : "Video");
const getCoverPath = (name, type) => path.join(defaultConfig.ImagesDir, "Folder", type, name + ".jpg");

export const transferFiles = async (folder, Name, Path) => {
  console.log(folder.Path, Path);
  fs.moveSync(folder.Path, Path, { overwrite: true });

  const type = folder.FilesType;

  const oldCover = getCoverPath(folder.Name, type);
  const Cover = getCoverPath(Name, type);
  //rename cover name
  if (fs.existsSync(oldCover) && Cover !== oldCover) {
    fs.moveSync(oldCover, Cover, { overwrite: true });
  }
  //Rename Folder for thumbnail
  if (Name !== folder.Name) {
    const thumbsPath = `${defaultConfig.ImagesDir}/${getFileType(folder)}/${Name}`;
    if (fs.existsSync(thumbsPath)) {
      const newthumbsPath = thumbsPath.replace(Name, folder.Name);
      try {
        fs.moveSync(thumbsPath, newthumbsPath);
      } catch (error) {
        console.log(error);
      }
    }
  }
};
