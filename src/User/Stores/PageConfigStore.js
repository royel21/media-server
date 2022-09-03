import { writable } from "svelte/store";
import { getObject, setObject } from "./StoreUtils";

const initConfig = {
  order: {
    Content: "",
    Mangas: "",
    Videos: "'",
  },
  items: 0,
};

const PageConfig = writable(getObject("config") || initConfig);

const updateConfig = async (config) => {
  PageConfig.update((cfg) => (cfg = config));
  setObject("config", config);
  return config;
};

export { PageConfig, updateConfig };
