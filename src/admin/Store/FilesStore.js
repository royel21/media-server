import { writable } from "svelte/store";

const FilesStore = writable({ file: {}, files: [] });
const videoRegex = /\.(mp4|mkv|webm|ogg)$/i;
const MangaRegex = /\.zip$/i;
const TextRex = /\.(txt|srt|ass)$/i;
const ImageRegex = /\.(jpg|jpeg|png|webp)$/i;

const setFiles = (data) => {
  let files = [];

  if (data.files?.length > 0) {
    if (videoRegex.test(data.file.Name)) {
      files = data.files.filter((f) => videoRegex.test(f.Path));
    }

    if (MangaRegex.test(data.file.Name)) {
      files = data.files.filter((f) => MangaRegex.test(f.Path));
    }
    if (ImageRegex.test(data.file.Name)) {
      files = data.files.filter((f) => ImageRegex.test(f.Path));
    }
  }

  FilesStore.update(() => {
    return { file: data.file || {}, files };
  });
};

export { FilesStore, setFiles, videoRegex, MangaRegex, TextRex, ImageRegex };
