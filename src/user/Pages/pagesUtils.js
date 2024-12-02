import { isValidKey } from "src/ShareComponent/utils";

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
    Key: 45,
    CtrlKey: true,
    ShiftKey: false,
    AltKey: false,
    action: null,
  },
  NextFile: {
    Key: 46,
    CtrlKey: false,
    ShiftKey: false,
    AltKey: false,
    action: null,
  },
  SkipForward: {
    Key: 39,
    CtrlKey: false,
    ShiftKey: false,
    AltKey: false,
    action: null,
  },
  SkipBack: {
    Key: 37,
    CtrlKey: false,
    ShiftKey: false,
    AltKey: false,
    action: null,
  },
  FastForward: {
    Key: 39,
    CtrlKey: false,
    ShiftKey: false,
    AltKey: false,
    action: null,
  },
  FastBackward: {
    Key: 37,
    CtrlKey: false,
    ShiftKey: false,
    AltKey: false,
    action: null,
  },
  GotoStart: {
    Key: 37,
    CtrlKey: false,
    ShiftKey: false,
    AltKey: false,
    action: null,
  },
  GotoEnd: {
    Key: 37,
    CtrlKey: false,
    ShiftKey: false,
    AltKey: false,
    action: null,
  },
  Fullscreen: {
    Key: 13,
    CtrlKey: false,
    ShiftKey: false,
    AltKey: false,
    action: null,
  },
  VolumeDown: {
    Key: 38,
    CtrlKey: false,
    ShiftKey: false,
    AltKey: false,
    action: null,
  },
  VolumeUp: {
    Key: 40,
    CtrlKey: false,
    ShiftKey: false,
    AltKey: false,
    action: null,
  },
  Muted: {
    Key: 77,
    CtrlKey: false,
    ShiftKey: false,
    AltKey: false,
    action: null,
  },
  PlayOrPause: {
    Key: 32,
    CtrlKey: false,
    ShiftKey: false,
    AltKey: false,
    action: null,
  },
  ShowList: {
    Key: 30,
    CtrlKey: false,
    ShiftKey: false,
    AltKey: false,
    action: null,
  },
  Exit: {
    Key: 88,
    CtrlKey: false,
    ShiftKey: false,
    AltKey: false,
    action: null,
  },
};

export const handleKeyboard = (e) => {
  for (let key of Object.keys(KeyMap)) {
    if (isValidKey(e, KeyMap[key]) && KeyMap[key].action) {
      KeyMap[key].action(e);
      break;
    }
  }
};

export const mapKeys = (keys) => {
  for (const k of keys) {
    const key = KeyMap[k.Name];
    if (key) {
      key.Key = k.Key;
      key.CtrlKey = k.CtrlKey;
      key.ShiftKey = k.ShiftKey;
      key.AltKey = k.AltKey;
    }
  }
};

document.on = function (event, listener) {
  this.addEventListener(event, listener);
};

document.off = function (event, listener) {
  this.removeEventListener(event, listener);
};
