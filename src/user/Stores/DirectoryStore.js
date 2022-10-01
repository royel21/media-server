import { writable } from "svelte/store";

const DirId = writable({
  mangas: "",
  videos: "",
});

const updateDirId = (Id, type) => {
  DirId.update((dirId) => {
    dirId[type] = Id;
    return dirId;
  });

  return DirId;
};

export { DirId, updateDirId };
