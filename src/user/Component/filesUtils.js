import { navigate } from "svelte-routing";
import { formatTime } from "../Pages/pagesUtils";

const isMobile = /(android)|(iphone)/i.test(navigator.userAgent);
const scrollW = isMobile ? 15 : 0;
const itemW = isMobile ? 170 : 200;

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

export const getFilesPerPage = (i) => {
  let fwidth = document.body.offsetWidth;
  let items = Math.floor((fwidth - scrollW) / itemW);
  return items * i || 0;
};

export const genUrl = (page = 1, { order = "nu", items }, filter, type, id) => {
  let itemsperpage = +items || getFilesPerPage(3);

  // if (type.includes("content")) {
  //   type = `folder-content/${id}`;
  // }

  filter = (filter || "").replace("%", " ");
  let url = `/api/files/${type}/${order}/${page}/${itemsperpage}/${filter}`;
  return url;
};

export const ProcessFile = (file, type) => {
  const folderId = file.id;
  const { pathname } = location;

  switch (file.dataset.type) {
    case "Manga":
    case "Video": {
      localStorage.setItem("return-content", pathname);

      let segment = pathname.replace("content", "viewer").split("/").slice(0, 4);
      let url = `${segment.join("/")}/${folderId}`;

      navigate(url);
      break;
    }
    default: {
      localStorage.setItem("return-folder", pathname);
      let Type = pathname.split("/")[1];
      navigate(`/${type || Type}/content/${folderId}/`);
    }
  }
};
