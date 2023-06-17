import { writable } from "svelte/store";

const initConfig = {
  Home: { items: 0, sort: "nu" },
  Content: { items: 0, sort: "nu" },
  Mangas: { items: 0, sort: "nu" },
  Videos: { items: 0, sort: "nu" },
  Favorites: { items: 0, sort: "nu" },
};

export function getConfig() {
  const cfg = JSON.parse(localStorage.getItem("config"));

  if (cfg) {
    for (const key in initConfig) {
      initConfig[key] = cfg[key] ?? initConfig[key];
    }
  }

  return initConfig;
}

const PageConfig = writable(getConfig());

const updateConfig = (config) => {
  PageConfig.update((cfg) => (cfg = config));
  localStorage.setObject("config", config);
  return config;
};

export { PageConfig, updateConfig };
