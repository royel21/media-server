import { writable } from "svelte/store";

const initConfig = {
  Home: { items: 0, sort: "nu" },
  Content: { items: 0, sort: "nu" },
  Mangas: { items: 0, sort: "nu" },
  Videos: { items: 0, sort: "nu" },
  Favorites: { items: 0, sort: "nu" },
  Viewer: { manga: { imgAbjust: "fill", width: 65, webtoon: false } },
};

let ConfigStore;

let username = "";

export const setConfig = (name) => {
  username = name;
  console.log(name);
  const cfg = JSON.parse(localStorage.getItem(name));

  if (cfg) {
    for (const key in initConfig) {
      initConfig[key] = cfg[key] ?? initConfig[key];
    }
  }

  initConfig;

  ConfigStore = writable(initConfig);
};

const updateConfig = (cfg) => {
  ConfigStore.update((old) => (old = cfg));
  localStorage.setObject(username, cfg);
  return cfg;
};

export { ConfigStore, updateConfig };
