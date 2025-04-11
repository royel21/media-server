export const calRows = (query) => {
  let container = document.querySelector(query || ".list-container") || {};
  const li = container.querySelector("li");
  return parseInt(container.offsetHeight / li.offsetHeight);
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

export const map = (val, min, max) => Math.min(Math.max(min, val), max);

export const isDiff = (obj1, obj2) => {
  for (const key of Object.keys(obj1)) {
    if (obj1[key] !== obj2[key]) return true;
  }

  return false;
};

export const validateCheck = (list, items) => {
  if (list.length === 0) return false;

  for (const item of items) {
    if (!list.includes(item.Id)) {
      return false;
    }
  }
  return true;
};

export const formatSize = (size) => {
  return (size / 1024 / 1024).toFixed(3) + "GB";
};
