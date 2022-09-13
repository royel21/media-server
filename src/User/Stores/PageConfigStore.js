import { writable } from "svelte/store";
import { getObject, setObject } from "./StoreUtils";

const initConfig = {
  Home: { items: 0, sort: "nu" },
  Content: { items: 0, sort: "nu" },
  Mangas: { items: 0, sort: "nu" },
  Videos: { items: 0, sort: "nu" },
  Favorites: { items: 0, sort: "nu" },
};
const checkConfig = () => {
  const config = getObject("config") || initConfig;

  for (const k in initConfig) {
    if (!config[k]) {
      config[k] = initConfig[k];
    }
  }
  return config;
};

const PageConfig = writable(checkConfig());

const updateConfig = async (config) => {
  PageConfig.update((cfg) => (cfg = config));
  setObject("config", config);
  return config;
};
export { PageConfig, updateConfig };
