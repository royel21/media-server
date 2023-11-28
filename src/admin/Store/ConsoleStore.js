import { writable } from "svelte/store";

const ConsoleStore = writable([]);

const updateConsole = (data) => {
  ConsoleStore.update((old) => {
    old.push(data);
    if (old.length > 200) {
      old = old.slice(old.length - 100, old.length - 1);
    }
    old = old;
    return old;
  });
};

const setConsoleData = (arr) => {
  ConsoleStore.update(() => arr);
};

export { ConsoleStore, updateConsole, setConsoleData };
