// import axios from "axios";

export const post = async (route, params) => {
  try {
    return await fetch(`/api/${route}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    }).then((res) => res.json()); //await axios.post(`/api/${route}`, params);
  } catch (error) {
    return { error, valid: false };
  }
};

let cancel;

export const get = async (route) => {
  const p = route.filter((p) => p).join("/");

  try {
    // const { data } = await axios.get(`/api/${p}`);
    return await fetch(`/api/${p}`).then((res) => res.json());
    // return data;
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
    if (controller) {
      controller.abort();
    }

    controller = new AbortController();

    return await fetch(url, { signal: controller.signal }).then((res) => res.json()); //await axios.get(url, { cancelToken: new axios.CancelToken((c) => (cancel = c)) });
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
};
