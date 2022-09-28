import axios from "axios";

export const post = async (route, params) => {
  try {
    const { data } = await axios.post(`/api/${route}`, params);
    return data;
  } catch (error) {
    return { error, valid: false };
  }
};

let cancel;

export const get = async (route) => {
  const p = route.filter((p) => p).join("/");

  try {
    const { data } = await axios.get(`/api/${p}`);
    return data;
  } catch (error) {
    return { error, valid: false };
  }
};

export const postFav = async (route, params) => post("files/favorites/" + route, params);

const admin = async (path) => get(["admin", ...path]);
const files = async (path) => get(["files", ...path]);

export const getItemsList = async (url) => {
  try {
    if (cancel) cancel();

    const { data } = await axios.get(url, { cancelToken: new axios.CancelToken((c) => (cancel = c)) });
    return data;
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
