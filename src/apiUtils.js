export const post = async (route, params) => {
  try {
    return await fetch(`/api/${route}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
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

export const get = async (route) => {
  const url = ["/api", ...route].filter((p) => p).join("/");
  try {
    return await fetch(url).then((res) => res.json());
  } catch (error) {
    return { error, valid: false };
  }
};

export const postFav = async (route, params) => post("files/favorites/" + route, params);

const admin = async (path) => get(["admin", ...path]);
const files = async (path) => get(["files", ...path]);

let controller;

export const getItemsList = async (url) => {
  try {
    controller?.abort();
    controller = new AbortController();

    return await fetch(url, { signal: controller.signal }).then((res) => res.json());
  } catch (error) {
    return { valid: false, error };
  }
};

export default {
  get,
  post,
  admin,
  files,
  postFav,
  postFile,
};
