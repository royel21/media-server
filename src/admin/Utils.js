export const calRows = () => {
  let container = document.querySelector(".list-container") || {};
  return parseInt(container.offsetHeight / 41.1);
};

export const validGenres = (g) => {
  return g
    .split(", ")
    .map((ge) => (/school/i.test(ge) ? "School Life" : ge.trim()))
    .sort()
    .join(", ");
};

export const map = (val, min, max) => Math.min(Math.max(min, val), max);
