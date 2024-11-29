export const defaultValue = {
  NextTab: { key: 38, name: "Next Tab", ctrlKey: true, shiftKey: false, altKey: false },
  PrevTab: { key: 40, name: "Prev Tab", ctrlKey: true, shiftKey: false, altKey: false },
  ContinueReading: {
    key: 39,
    name: "Continue Reading",
    ctrlKey: true,
    shiftKey: false,
    altKey: false,
  },
  Open: { key: 37, ctrlKey: true, shiftKey: false, altKey: false },
  Exit: { key: 77, ctrlKey: true, shiftKey: false, altKey: false },
};

let keymap;

export const getDefaultKeymap = () => {
  const km = {};
  for (const key in defaultValue) {
    km[key] = { ...defaultValue[key] };
  }
  return km;
};

export const getKeymap = () => {
  if (!keymap) {
    keymap = getDefaultKeymap();
    for (const key in defaultValue) {
      keymap[key] = { ...defaultValue[key] };
    }

    const temp = JSON.parse(localStorage.getItem("keymap"));
    if (temp) {
      for (const key in keymap) {
        keymap[key].key = temp[key]?.key || keymap[key].key;
        keymap[key].ctrlKey = temp[key]?.ctrlKey || keymap[key].ctrlKey;
        keymap[key].altKey = temp[key]?.altKey || keymap[key].altKey;
        keymap[key].shiftKey = temp[key]?.shiftKey || keymap[key].shiftKey;
      }
    }
  }
  return keymap;
};

export const saveKeyMap = (keymap) => {
  const temp = {};
  for (const key in keymap) {
    temp[key] = { ...keymap[key] };
    delete temp[key].action;
  }
  localStorage.setItem("keymap", JSON.stringify(temp));
};
