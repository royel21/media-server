import { writable } from "svelte/store";

const MangaStore = writable({ file: {}, files: [] });
const MangaRegex = /\.zip$/i;

const setViewer = (data) => {
  let files = [];

  if (data.files.length) {
    files = data.files.filter((f) => MangaRegex.test(f.Path));
  }

  MangaStore.update(() => {
    return { file: data.file || {}, files };
  });
};

export { MangaStore, setViewer, MangaRegex };
