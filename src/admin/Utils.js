export const calRows = (query) => {
  let container = document.querySelector(query || ".list-container") || {};
  const li = container.querySelector("li");
  return parseInt(container.offsetHeight / li.offsetHeight);
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

export const loadObject = (key) => JSON.parse(localStorage.getItem(key));
export const saveObject = (key, value) => localStorage.setItem(key, JSON.stringify(value));
