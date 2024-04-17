export const calRows = (query) => {
  let container = document.querySelector(query || ".list-container") || {};
  return parseInt(container.offsetHeight / 40);
};

export const validGenres = (g) => {
  return g
    .split(/(,|\/|\n)/g)
    .filter((g) => g)
    .map((ge) => (/school/i.test(ge) ? "School Life" : ge.trim()))
    .sort()
    .join(", ");
};

export const validateAuthor = (auth) => {
  return auth
    .split(/\/|,|;/)
    .map((a) => a.trim())
    .filter((a) => a)
    .join(", ");
};

export const map = (val, min, max) => Math.min(Math.max(min, val), max);
