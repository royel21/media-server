import { writable } from "svelte/store";

const initConfig = {
  Home: { items: 0, sort: "nu" },
  Content: { items: 0, sort: "nu" },
  Mangas: { items: 0, sort: "nu" },
  Videos: { items: 0, sort: "nu" },
  Favorites: { items: 0, sort: "nu" },
};
const checkConfig = () => {
  let config = initConfig;
  const tconfig = JSON.parse(localStorage.getItem("config"));
  if (tconfig) {
    for (const k in initConfig) {
      if (!config[k]) {
        config[k] = tconfig[k] || config[k];
      }
    }
  }
  return config;
};

const PageConfig = writable(checkConfig());

const updateConfig = (config) => {
  PageConfig.update((cfg) => (cfg = config));
  localStorage.setObject("config", config);
  return config;
};
export { PageConfig, updateConfig };
