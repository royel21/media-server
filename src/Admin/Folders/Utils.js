export const calRows = () => {
  let container = document.querySelector(".list-container") || {};
  return parseInt(container.offsetHeight / 37.19);
};

export const clamp = (num, min, max) => Math.min(Math.max(num, min), max);
