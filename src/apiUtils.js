let controller = {};

export const post = async (route, params, key = "post") => {
  controller[key]?.abort();
  controller[key] = new AbortController();
  try {
    return await fetch(`/api/${route}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
      signal: controller[key].signal,
    }).then((res) => res.json());
  } catch (error) {
    return { error, valid: false };
  }
};

export const postFile = async (route, data) => {
  let body = new FormData();

  for (const k in data) {
    body.append(k, data[k]);
  }

  return await fetch(`/api/${route}`, { method: "POST", body }).then((res) => res.json());
};

export const get = async (route = [], key = "get") => {
  controller[key]?.abort();
  controller[key] = new AbortController();
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

const admin = async (path, key = "get") => get(["admin", ...path], key);
const files = async (path, key = "get") => get(["files", ...path], key);

export const getItemsList = async (url, key = "item-list") => {
  try {
    controller[key]?.abort();
    controller[key] = new AbortController();

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
  postFile,
  cancelQuery,
  getStatic,
};
