import { createDir } from "./Downloader/utils.js";
import db from "./models/index.js";
import path from "path";

export const sendMessage = async (data, event = "info", log = true) => {
  if (data.msg || data.text || data.error) {
    console.log(data.msg || data.text || "", data.error || "");
  }

  if ((data.msg || data.text) && log) {
    if (log) {
      const newEvent = {
        event,
        ...data,
        text: data.msg || data.text,
        Id: null,
      };

      delete newEvent.Id;

      await db.eventLog.create(newEvent);
    }
  }
  process.send({ event, message: data });
};

export const getProgress = (count, length) => {
  const padding = length.toString().length;
  count = count.toString().padStart(padding, "0");
  return `${count}/${length}`;
};

const toLowerList = /^(For|No|It|Of|And|In|X|Du|Or|A|Wa|wo|na|to|ni|de|o|by)$/i;

export const capitalize = (val, splitter = " ", Preserve = true) => {
  let words = val.replace(/( )+/g, " ").split(splitter);

  if (words.length > 1) {
    for (let i = 0; i < words.length; i++) {
      if (i == 0 && words[i].length === 1) {
        words[i] = words[i].toUpperCase();
        continue;
      }

      if (toLowerList.test(words[i])) {
        words[i] = words[i].toLowerCase();
        continue;
      }

      if (words[i].length > 1) {
        let word = words[i];
        //find first letter index
        const index = word.split("").findIndex((c) => /[a-z]/i.test(c));
        if (index > -1) {
          words[i] = word.slice(0, index + 1).toUpperCase();
          if (Preserve) {
            words[i] += word.slice(index + 1);
          } else {
            words[i] += word.slice(index + 1).toLowerCase();
          }
        }
      }
    }
  }

  let result = words.join(splitter).trim();

  const found = result.match(/(\.|:|,) [a-z] /gi);
  if (found) {
    result = result.replace(found[0], found[0].toUpperCase());
  }

  return result;
};

export const getElapseSec = (date) => {
  const differenceInMilliseconds = new Date() - date;
  return differenceInMilliseconds / 1000;
};

export const createDefaultImageDirs = (CoverPath) => {
  createDir(path.join(CoverPath, "Folder", "videos"));
  createDir(path.join(CoverPath, "Folder", "mangas"));
  createDir(path.join(CoverPath, "Manga"));
  createDir(path.join(CoverPath, "Video"));
};
