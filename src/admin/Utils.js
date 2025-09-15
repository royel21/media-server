export const calRows = (query) => {
  let container = document.querySelector(query || ".list-container");
  if (!container) return 0;

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

export const getSize2 = (file) => {
  let size = file.Size / 1024;
  let type = "KB";

  if (size > 1000) {
    type = "MB";
    size = file.Size / 1024 / 1024;
  }

  if (size > 1000) {
    size = file.Size / 1024 / 1024 / 1024;
    type = "GB";
  }

  if (size < 10) {
    size = size.toFixed(2);
  } else if (size < 100) {
    size = size.toFixed(1);
  } else {
    size = parseInt(size);
  }
  return size + type;
};

export const getSize3 = (file) => {
  if (!file.Size) return "N/A";

  let size = file.Size;
  let type = " KB";

  if (size > 1000) {
    type = " MB";
    size = file.Size / 1024;
  }

  if (size > 1000) {
    size = file.Size / 1024 / 1024;
    type = " GB";
  }

  if (size < 10) {
    size = size.toFixed(3);
  } else if (size < 100) {
    size = size.toFixed(2);
  } else {
    size = parseInt(size);
  }
  return size + type;
};

export const mapFilePath = (f) => {
  let Path = `${f.Path}${/^\//.test(f.Path) ? "/" : "\\"}${f.Name}`;
  return { ...f, Path };
};
