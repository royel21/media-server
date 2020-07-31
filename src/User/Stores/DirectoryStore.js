import { writable } from "svelte/store";
import { getObject, setObject } from "./Util";

const DirId = writable(
    getObject("DirId") || {
        mangas: "",
        videos: "",
    }
);

const updateDirId = async (Id, type) => {
    DirId.update((dirId) => {
        dirId[type] = Id;
        return dirId;
    });
    setObject("DirId", DirId);
    return DirId;
};

export { DirId, updateDirId };
