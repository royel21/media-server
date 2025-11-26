import { writable } from "svelte/store";

const initConfig = {
  Viewer: { manga: { imgAbjust: "fill", width: isMobile() ? 100 : 65, webtoon: false } },
};

let ConfigStore;

export const setConfig = (key) => {
  if (key) {
    localStorage.setItem("user", key);
    const cfg = JSON.parse(localStorage.getItem(key + "-config"));

    if (cfg) {
      for (const key in initConfig) {
        initConfig[key] = cfg[key] ?? initConfig[key];
      }
    }

    ConfigStore = writable(initConfig);
  }
};

const updateConfig = (cfg) => {
  ConfigStore.update((old) => (old = cfg));
  localStorage.setObject(localStorage.getItem("user") + "-config", cfg);
  return cfg;
};

export { ConfigStore, updateConfig };
