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

export const validGenres = (g, tags) => {
  const regex = new RegExp(tags.join("|"), "ig");
  const parts = g.match(regex) || [];

  const gens = new Set([...parts, ...g.replace(regex, "").split(/,|\/|\n| /g)].sort());
  return [...gens].filter((g) => g.trim()).join(", ");
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

export const validAltName = (v) => {
  return v
    .replace(/( |)(•|\/)( |)/g, "; ")
    .replace("N; A", "N/A")
    .trim();
};
