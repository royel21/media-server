import { writable } from "svelte/store";

const FilesStore = writable({ file: {}, files: [] });
const videoRegex = /\.(mp4|mkv|webm|ogg)$/i;
const MangaRegex = /\.zip$/i;
const ImageRegex = /\.(jpg|jpeg|png|webp)$/i;
const textRegex = ".(txt|srt|ass|js|svelte|jsx|css|html|htmx|json|md|bat|sh|manifest|ini";
const textRegex2 = textRegex + "|py|cpp|c|h|hpp|lua|glsl|inl|in|log)";
const TextRex = new RegExp(textRegex2, "i");

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
  if (file?.Path) {
    FilesStore.update(() => {
      return { file: data.file || {}, files };
    });
  }
};

export { FilesStore, setFiles, videoRegex, MangaRegex, TextRex, ImageRegex };
