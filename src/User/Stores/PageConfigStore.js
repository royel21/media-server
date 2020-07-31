import { writable } from "svelte/store";
import { getObject, setObject } from "./Util";

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
    return config;
};

export { PageConfig, updateConfig };
