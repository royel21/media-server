export function formatTime(time) {
  if (time === 0) return "00:00";

  var h = Math.floor(time / 3600);
  var min = Math.floor((time / 3600 - h) * 60);
  var sec = Math.floor(time % 60);
  return (h === 0 ? "" : h + ":") + String(min).padStart(2, "0") + ":" + String(sec).padStart(2, "0");
}

export const PageTitles = {
  mangas: "Mangas",
  videos: "Videos",
  folders: "Folders",
  favorites: "Favorites",
  "folder-content": "Folder-content",
};

export const map = function (value, in_min, in_max, out_min, out_max) {
  return ((value - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min;
};

var lastEl = null;
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
      }
    }
  } catch (err) {
    console.log(err);
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
