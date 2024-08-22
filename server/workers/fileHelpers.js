import fs from "fs-extra";
import path from "path";

const sendMessage = (data, event = "files-info") => {
  console.log(data.msg || "", data.error || "");
  process.send({ event, message: data });
};

export const moveFiles = ({ files, Path, overwrite }) => {
  sendMessage({ msg: `Moving Files to: ${Path} Please Wait` });

  if (!fs.existsSync(Path)) {
    return sendMessage({ error: `The specified path does not exist: ${Path}` });
  }

  for (const file of files) {
    try {
      if (fs.existsSync(file.Path)) {
        fs.moveSync(file.Path, path.join(Path, file.Name), { overwrite });
      }
    } catch (error) {
      if (!overwrite) {
        sendMessage({ error: `Error moving: ${file.Name}`, err: error });
      }
    }
  }
  sendMessage({ msg: `Finish Moving Files to: ${Path}`, items: files.map((f) => f.Id) });
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
  sendMessage({ msg: "Finish Removing Files", items: files.map((f) => f.Id) });
};
