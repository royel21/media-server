import { writable } from "svelte/store";
import { getObject, setObject } from "./Util";

let config = location.pathname.includes("content")
    ? { order: localStorage.getItem("content-order"), items: 0 }
    : getObject("config") || {
          order: "dd",
          items: 0,
      };

const PageConfig = writable(
    getObject("config") || {
        order: "dd",
        items: 0,
    }
);

const updateConfig = async (config) => {
    PageConfig.update((cfg) => (cfg = config));
    setObject("config", config);
    console.log(config);
    localStorage.setItem("content-order", config.order);
    return config;
};

export { PageConfig, updateConfig };
