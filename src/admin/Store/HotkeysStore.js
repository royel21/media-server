import { writable } from "svelte/store";
import { getKeymap, saveKeyMap, getDefaultKeymap } from "./keymap";

const HotkeysStore = writable(getKeymap());

const update = (cmd, change) => {
  HotkeysStore.update((old) => {
    old[cmd] = change;
    return old;
  });
};

const save = () => saveKeyMap();

const restore = () => {
  console.log("restore");
  HotkeysStore.set(getDefaultKeymap());
  save();
};

export { HotkeysStore, update, restore, save };
