let controller = {};

const getController = (key) => {
  controller[key]?.abort();
  controller[key] = new AbortController();
};

export const post = async (route = "", data = [], key = "p-data") => {
  getController(key);

  let body = new FormData();

  for (const k in data) {
    if (data[k]) {
      body.append(k, data[k]);
    }
  }

  try {
    const url = `/api/${route}`.replace(/(\/)+/g, "/");

    return await fetch(url, {
      method: "POST",
      body,
      signal: controller[key].signal,
    }).then((res) => res.json());
  } catch (error) {
    return { error, valid: false };
  }
};

export const get = async (route = [], key = "get") => {
  getController(key);
  const url = ["/api", ...route].filter((p) => p).join("/");
  try {
    return await fetch(url, { signal: controller[key].signal }).then((res) => res.json());
  } catch (error) {
    return { error, valid: false };
  }
};

export const getStatic = async (url) => {
  try {
    return await fetch(url).then((res) => res.json());
  } catch (error) {
    return { valid: false, error };
  }
};

export const postFav = async (route, params) => post("files/favorites/" + route, params);

const admin = async (path = [], key = "get") => get(["admin", ...path], key);
const files = async (path = [], key = "get") => get(["files", ...path], key);

export const getItemsList = async (url, key = "item-list") => {
  try {
    getController(key);

    return await fetch(url, { signal: controller[key].signal }).then((res) => res.json());
  } catch (error) {
    return { valid: false, error };
  }
};

export const cancelQuery = (key) => {
  controller[key]?.abort();
};

export default {
  get,
  post,
  admin,
  files,
  postFav,
  cancelQuery,
  getStatic,
};
