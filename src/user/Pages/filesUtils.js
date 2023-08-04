import { navigate } from "svelte-routing";
import { formatTime } from "./pagesUtils";
import { saveId } from "../Component/fileEvents";

const isMobile = window.innerWidth < 501;
const scrollW = isMobile ? 15 : 0;
const itemW = isMobile ? 204 : 220;

export const FileTypes = {
  Manga: {
    type: "mangas",
    class: "bookopen",
    formatter: (a, b) => `${parseInt(a || 0) + 1}/${b}`,
  },
  Video: {
    type: "videos",
    class: "playcircle",
    color: "",
    formatter: (a, b) => `${formatTime(a)}/${formatTime(b)}`,
  },
  Folder: {
    type: "folders",
    class: "folderopen",
    color: "rgb(250, 183, 15)",
    formatter() {
      return "";
    },
  },
};

Storage.prototype.getObject = function (key) {
  let value = this.getItem(key);

  try {
    value = JSON.parse(value);
  } catch (err) {
    console.log(err);
  }
  return value || {};
};

const user = localStorage.getItem("user") + "-path";
const pathStore = localStorage.getObject(user);

export const saveReturnPath = (name, path) => {
  pathStore[name] = path;
  localStorage.setObject(user, pathStore);
};

export const getReturnPath = (name) => pathStore[name];

export const getFilesPerPage = (i) => {
  let fwidth = document.body.offsetWidth;
  let items = Math.floor((fwidth - scrollW) / itemW);
  return items * i || 0;
};

export const ProcessFile = (file, type, title) => {
  const folderId = file.id;
  const { pathname } = location;

  switch (file.dataset.type) {
    case "Manga":
    case "Video": {
      saveReturnPath("open-folder", pathname);

      let segment = pathname.replace("content", "viewer").split("/").slice(0, 4);
      let url = `${segment.join("/")}/${folderId}`;

      navigate(url);
      break;
    }
    default: {
      saveId(title, folderId);
      saveReturnPath("to-menu", pathname);
      type = type || pathname.split("/")[1];
      navigate(`/${type}/content/${folderId}/`);
    }
  }
};
