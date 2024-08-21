import fs from "fs-extra";
import { getDb } from "./db-worker.js";

export const isChar = (c) => {
  return c.match(/[a-z]/i);
};

export const capitalize = (val) => {
  let words = val.split(" ");
  for (let i = 0; i < words.length; i++) {
    let word = words[i].toLowerCase();

    if (i === 0 && words[i].length > 1 && !isChar(words[i][0])) {
      words[i] = words[i].substring(0, 2).toUpperCase() + word.slice(2);
    } else {
      words[i] = word.charAt(0).toUpperCase() + word.slice(1);
    }
  }
  return words.join(" ");
};

export const nameFormat = (name) => {
  name = capitalize(name);
  name = name.replace(/vol. /gi, "Vol.");
  if (/Comic /gi.test(name)) {
    let num = name.match(/\d+/);
    if (num) {
      name = name.replace(num, num.toString().padStart(3, "0"));
    }
  }
  return name;
};

export const filterManga = (files) => (d) => {
  if (!d.name || /\d+-\d+ raw/i.test(d.name)) return false;

  return !files.find((f) => {
    let num = f.match(/\d+(-\d+|)/);
    let num2 = d.name.match(/\d+(-\d+|)/);

    if (num && num2) {
      if (/ raw/i.test(f) && !/ raw/i.test(d.name) && num[0] === num2[0]) {
        return false;
      }

      return num[0] === num2[0];
    }

    return false;
  });
};

export const findDub = (name) => (f) => {
  let num = f.name.match(/\d+(-\d+|)/);
  let num2 = name.match(/\d+(-\d+|)/);

  return num[0] === num2[0];
};

export const findRaw = (name) => (f) => {
  let num = f.match(/\d+(-\d+|)/);
  let num2 = name.match(/\d+(-\d+|)/);

  if (/ raw/i.test(f)) {
    if (num[0] === num2[0]) return true;
  }

  return false;
};

export const removeRaw = (f, data) => {
  let num = f.name?.match(/\d+(-\d+|)/);
  return !data.find((d2) => d2.name.startsWith(num[0]) && !/ raw/i.test(d2.name));
};

export const dateDiff = (d1, d2) => parseInt(Math.abs(d1 - d2) / 36e5);

export function sendMessage(data, event = "info") {
  const db = getDb();
  if (data.text || data.error) {
    console.log(data.text || "", data.error || "");
    if (data.error) {
      data.error = data.error.toString().slice(0, 500);
    }
  }
  if (data.text?.includes("\x1B[1;31m")) {
    data.text = data.text.replace(/\x1B\[1;31m | \x1B\[0m/gi, "");
    data.color = "red";
  }

  if (process.send) {
    process.send({ event, data: { color: "blue", ...data } });
  }

  if (data.error && !data.error.toString().includes("ProtocolError: Page.enable")) {
    db.eventLog.create({
      event,
      ...data,
    });
  }
}

export const createDir = (dir) => {
  try {
    if (!fs.existsSync(dir)) {
      fs.mkdirsSync(dir);
      return true;
    }
  } catch (error) {
    console.log("create-dir-error: ", error);
  }
  return false;
};

const types = { mangas: "Manga", videos: "Video" };
export const getFileType = ({ FilesType }) => types[FilesType];
