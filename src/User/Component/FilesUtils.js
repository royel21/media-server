import { navigate } from "svelte-routing";
import { formatTime } from "../Pages/Utils";

const isMobile = /(android)|(iphone)/i.test(navigator.userAgent);
const scrollW = isMobile ? 15 : 0;
const itemW = isMobile ? 170 : 200;

export const FileTypes = {
  Manga: {
    type: "mangas",
    class: "book-open",
    formatter: (a, b) => `${parseInt(a || 0) + 1}/${b}`,
  },
  Video: {
    type: "videos",
    class: "play-circle",
    formatter: (a, b) => `${formatTime(a)}/${formatTime(b)}`,
  },
  Folder: {
    type: "folders",
    class: "folder-open",
    formatter() {
      return "";
    },
  },
};

export const getFilesPerPage = (i) => {
  let fwidth = document.body.offsetWidth;
  let items = parseInt((fwidth - scrollW) / itemW);
  return items * i || 0;
};

export const genUrl = (page = 1, { order = "nu", items }, filter, type, id, dir) => {
  let itemsperpage = +items || getFilesPerPage(3);

  if (type.includes("content")) {
    type = `folder-content/${id}`;
  }

  filter = (filter || "").replace("%", " ");
  let url = "";
  if (["mangas", "videos"].includes(type)) {
    url = `/api/files/${type}/${dir}/${order}/${page}/${itemsperpage}/${filter}`;
  } else {
    url = `/api/files/${type}/${order}/${page}/${itemsperpage}/${filter}`;
  }
  return url;
};

export const ProcessFile = (file, socket, type) => {
  const curPath = location.pathname;
  switch (file.dataset.type) {
    case "Manga":
    case "Video": {
      let segment = curPath.replace("content", "viewer").split("/").slice(0, 4);

      let url = `${segment.join("/")}/${file.id}`;
      localStorage.setItem("content", curPath);
      localStorage.setItem("fileId", file.id);

      navigate(url);
      if (socket)
        socket.emit("recent-folder", {
          CurrentFile: file.id,
          FolderId: segment[3],
        });
      break;
    }
    default: {
      localStorage.setObject("folder", {
        folder: file.id,
        pathname: curPath,
      });
      let Type = location.pathname.split("/")[1];
      navigate(`/${type || Type}/content/${file.id}/`);
    }
  }
};
