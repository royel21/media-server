import fs from "fs-extra";
import { getDb } from "./db-worker.js";

export const isChar = (c) => {
  return c.match(/[a-z]/i);
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
        console.log(words[i]);
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

  const found = result.match(/(\.|,) [a-z] /gi);
  if (found) {
    result = result.replace(found[0], found[0].toUpperCase());
  }

  return result;
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

export const removeRaw = (data) => (f) => {
  if (!/^\d+/.test(f.name)) return false;

  if (/ raw/i.test(f.name)) {
    let num = f.name.match(/\d+(-\d+|)/);
    return !data.find((d2) => d2.name.startsWith(num[0]) && !/ raw/i.test(d2.name));
  }

  return f.name;
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
    console.log(error);
  }
  return false;
};

const types = { mangas: "Manga", videos: "Video" };
export const getFileType = ({ FilesType }) => types[FilesType];

export const delay = (ms) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

function containsJapaneseOrChinese(text) {
  return /[\u3400-\u9FBF]|[\u1100-\u11FF\u3130-\u318F\uA960-\uA97F\uAC00-\uD7AF\uD7B0-\uD7FF]/g.test(text);
}

export const fixAltName = (AltName) => {
  const names = [...new Set(AltName.split("; "))];

  const removeDub = (items) => (n1) => items.filter((n2) => n2.includes(n1)).length === 1;

  const sortJapFirst = (a) => {
    if (containsJapaneseOrChinese(a)) {
      return -1;
    }
    return 0;
  };

  return names.filter(removeDub(names)).sort(sortJapFirst).join("; ");
};
