import { writable } from "svelte/store";
import { getObject, setObject } from "./StoreUtils";

const initConfig = {
  Home: { items: 0, sort: "nd" },
  Content: { items: 0, sort: "nd" },
  Mangas: { items: 0, sort: "nd" },
  Videos: { items: 0, sort: "nd" },
};
const conf = getObject("config");

let PageConfig;
if (conf.Home?.sort) {
  PageConfig = writable(conf);
} else {
  PageConfig = writable(initConfig);
}

const updateConfig = async (config) => {
  PageConfig.update((cfg) => (cfg = config));
  setObject("config", config);
  return config;
};
export { PageConfig, updateConfig };
