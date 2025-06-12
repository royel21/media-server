import { writable } from "svelte/store";

const FilesStore = writable({ file: {}, files: [] });
const videoRegex = /\.(mp4|mkv|webm|ogg)$/i;
const MangaRegex = /\.zip$/i;
const TextRex = /\.txt$/i;

const setFiles = (data) => {
  let files = [];

  if (data.files?.length > 0) {
    if (videoRegex.test(data.file.Name)) {
      files = data.files.filter((f) => videoRegex.test(f.Path));
    }

    if (MangaRegex.test(data.file.Name)) {
      files = data.files.filter((f) => MangaRegex.test(f.Path));
    }
  }

  FilesStore.update(() => {
    return { file: data.file || {}, files };
  });
};

export { FilesStore, setFiles, videoRegex, MangaRegex, TextRex };
