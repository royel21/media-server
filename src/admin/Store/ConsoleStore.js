import { writable } from "svelte/store";

const ConsoleStore = writable([]);
const showConsoleStore = writable(false);

const updateConsole = (data) => {
  ConsoleStore.update((old) => {
    old.push(data);
    return old;
  });
};

const setConsoleData = (arr) => {
  ConsoleStore.update(() => arr);
};

export { ConsoleStore, updateConsole, setConsoleData, showConsoleStore };
