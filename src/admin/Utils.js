export const calRows = (query) => {
  let container = document.querySelector(query || ".list-container") || {};
  return parseInt(container.offsetHeight / 40);
};

export const validGenres = (g) => {
  return g
    .split(/,|\/|\n/g)
    .filter((g) => g)
    .map((ge) => (/school,/gi.test(ge) ? "School Life" : ge.trim()))
    .sort()
    .join(", ");
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
  return v.replace(/( |)(•|\/)( |)/g, "; ");
};

export const map = (val, min, max) => Math.min(Math.max(min, val), max);

export const isDiff = (obj1, obj2) => {
  for (const key of Object.keys(obj1)) {
    if (obj1[key] !== obj2[key]) return true;
  }

  return false;
};
