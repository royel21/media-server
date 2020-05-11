import { writable } from "svelte/store";

const ToggleMenu = writable(false);

const updateToggleMenu = async (newVal) => {
  ToggleMenu.update((value) => (newVal !== undefined ? newVal : !value));
};

export { ToggleMenu, updateToggleMenu };
