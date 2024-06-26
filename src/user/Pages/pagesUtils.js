export const isMobile = /android|iphone/i.test(navigator.userAgent);
export const isVideo = (file) => file.Type.includes("Video");
export const isManga = (file) => file.Type.includes("Manga");
/**
 * Format a number to a string in the format of HH:MM:SS
 *
 * @param {Number} time
 * @returns HH:MM:SS
 * @type String
 */
export function formatTime(time) {
  if (time === 0) return "00:00";

  let h = Math.floor(time / 3600);
  let min = Math.floor((time / 3600 - h) * 60);
  let sec = Math.floor(time % 60);
  return (h === 0 ? "" : h + ":") + String(min).padStart(2, "0") + ":" + String(sec).padStart(2, "0");
}

export const PageTitles = {
  mangas: "Mangas",
  videos: "Videos",
  folders: "Folders",
  favorites: "Favorites",
  "folder-content": "Folder-content",
};

let lastEl = null;
export const setfullscreen = (element) => {
  try {
    if (lastEl && element.tagName !== "BODY") {
      if (document.fullscreenElement.tagName === "BODY") {
        document.exitFullscreen().then(() => {
          element.requestFullscreen();
        });
      } else {
        document.exitFullscreen().then(() => {
          lastEl.requestFullscreen();
        });
      }
    } else {
      if (!document.fullscreenElement) {
        element.requestFullscreen();
        if (element.tagName === "BODY") lastEl = element;
      } else {
        document.exitFullscreen();
        lastEl = null;
        return false;
      }
    }
  } catch (err) {
    console.log(err);
  }
  return true;
};

export const sortFileByName = (a, b) => {
  let n1 = a.Name.replace("-", ".").match(/^\d+.\d+|\d+/);
  let n2 = b.Name.replace("-", ".").match(/^\d+.\d+|\d+/);

  if (n1 && n2) {
    return Number(n1[0]) - Number(n2[0]) && a.Name.replace("-", "Z").localeCompare(b.Name?.replace("-", "Z"));
  } else {
    return a.Name.replace("-", "Z").localeCompare(b.Name?.replace("-", "Z"));
  }
};

let tout;
export const showFileName = () => {
  const tagName = document.querySelector(".viewer .f-name");
  if (tagName) {
    clearTimeout(tout);
    tagName.style.opacity = 1;
    tout = setTimeout(() => {
      tagName.style.opacity = 0;
    }, 5000);
  }
};

export const KeyMap = {
  PrevFile: {
    name: "Ins",
    keyCode: 45,
    isctrl: true,
    action: null,
  },
  NextFile: {
    name: "Del",
    keyCode: 46,
    isctrl: true,
    action: null,
  },
  SkipForward: {
    name: "ArrowRight",
    keyCode: 39,
    isctrl: false,
    action: null,
  },
  SkipBack: {
    name: "ArrowLeft",
    keyCode: 37,
    isctrl: false,
    action: null,
  },
  Fullscreen: {
    name: "Enter",
    keyCode: 13,
    isctrl: false,
    action: null,
  },
  VolumeUp: {
    name: "ArrowUp",
    keyCode: 38,
    isctrl: false,
    action: null,
  },
  VolumeDown: {
    name: "ArrowDown",
    keyCode: 40,
    isctrl: false,
    action: null,
  },
  PlayOrPause: {
    name: "Space",
    keyCode: 32,
    isctrl: false,
    action: null,
  },
  ShowList: {
    name: "L",
    keyCode: 30,
    isctrl: false,
    action: null,
  },
};

export const handleKeyboard = (e) => {
  for (let key of Object.keys(KeyMap)) {
    if (KeyMap[key].keyCode === e.keyCode) {
      let { action, isctrl } = KeyMap[key];
      if (action && e.ctrlKey === isctrl) action(e.ctrlKey);
      break;
    }
  }
};

document.on = function (event, listener) {
  this.addEventListener(event, listener);
};

document.off = function (event, listener) {
  this.removeEventListener(event, listener);
};
