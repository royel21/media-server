/**
 * Map a number from one range to another range
 *
 * @param {Number} value input value
 * @param {Number} in_min input min range
 * @param {Number} in_max input max range
 * @param {Number} out_min out min range
 * @param {Number} out_max out min range
 * @returns output value in the range [out_min, out_max]
 * @type Number
 */
export const map = function (value, in_min, in_max, out_min, out_max) {
  return ((value - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min;
};

/**
 * Returns a number whose value is limited to the given range.
 *
 * Example: limit the output of this computation to between min and max
 * clamp(num, min, max)
 *
 * @param {Number} num The value to check
 * @param {Number} min The lower boundary of the output range
 * @param {Number} max The upper boundary of the output range
 * @returns A number in the range [min, max]
 * @type Number
 */
export const clamp = (num, min, max) => {
  return Math.min(Math.max(num, min), max) || min;
};

export const sortByName = (f1, f2) => f1.Name.localeCompare(f2.Name);

export const isValidKey = (e, k) => {
  if (!k || !e) return false;

  return e.keyCode === k.Key && e.altKey === k.AltKey && e.shiftKey === k.ShiftKey && e.ctrlKey === k.CtrlKey;
};

export const validateAuthor = (auth) => {
  if (auth === "N/A") return auth;

  auth = auth
    .split(/\/|,|;/)
    .map((a) => a.trim())
    .filter((a) => a)
    .join(", ");
  return auth
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLocaleLowerCase())
    .join(" ");
};

export const validGenres = (g, tags, removeTags = []) => {
  const regex = new RegExp([...tags, ...removeTags].join("|"), "ig");
  const regex2 = new RegExp(tags.join("|"), "ig");

  const parts = g
    .replace(/Genres:(\t|)/g, "")
    .replace(regex, "")
    .split(/,|\/|\n| /g);

  const defTags = g.replace(/Genres\:/gi, "").match(regex2) || [];

  const gens = new Set([...defTags, ...parts].sort());

  return [...gens].filter((g) => g.trim()).join(", ");
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

  return result;
};

export const validAltName = (v) => {
  const result = v.replace(/( |)(•|\/ )( |)/g, "; ").trim();
  const altnames = capitalize(result);
  let parts = altnames.split("; ");

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (/^[a-z] /i.test(part)) {
      parts[i] = part[0].toUpperCase() + part.slice(1, part.length);
    }
  }

  return parts.join("; ");
};

export const getEvent = (e) => (e.touches ? e.touches[0] : e);
