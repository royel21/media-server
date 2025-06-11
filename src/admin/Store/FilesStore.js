import { writable } from "svelte/store";

const FilesStore = writable({ file: {}, files: [] });
const videoRegex = /\.(mp4|mkv|webm|ogg)$/i;

const setPlayer = (data) => {
  let files = [];

  if (data.files.length) {
    files = data.files.filter((f) => videoRegex.test(f.Path));
  }

  FilesStore.update(() => {
    return { file: data.file || {}, files };
  });
};

export { FilesStore, setPlayer, videoRegex };
