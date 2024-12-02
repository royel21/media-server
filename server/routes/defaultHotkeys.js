export const defHotkeys = [
  {
    Key: 13,
    Name: "Open",
    CtrlKey: false,
    ShiftKey: false,
    AltKey: false,
  },
  {
    Key: 88,
    Name: "Exit",
    CtrlKey: false,
    ShiftKey: false,
    AltKey: false,
  },
  {
    Key: 33,
    Name: "Next Tab",
    CtrlKey: false,
    ShiftKey: false,
    AltKey: false,
  },
  {
    Key: 34,
    Name: "Prev Tab",
    CtrlKey: false,
    ShiftKey: false,
    AltKey: false,
  },
  {
    Key: 67,
    Name: "Continue Reading",
    CtrlKey: false,
    ShiftKey: false,
    AltKey: false,
  },
  {
    Key: 37,
    Name: "SkipBack",
    CtrlKey: false,
    ShiftKey: false,
    AltKey: false,
  },

  {
    Key: 39,
    Name: "SkipForward",
    CtrlKey: false,
    ShiftKey: false,
    AltKey: false,
  },
  {
    Name: "FastBackward",
    Key: 37,
    CtrlKey: true,
    ShiftKey: false,
    AltKey: false,
    action: null,
  },
  {
    Name: "FastForward",
    Key: 39,
    CtrlKey: true,
    ShiftKey: false,
    AltKey: false,
    action: null,
  },
  {
    Key: 37,
    Name: "GotoStart",
    CtrlKey: true,
    ShiftKey: false,
    AltKey: false,
  },
  {
    Key: 39,
    Name: "GotoEnd",
    CtrlKey: true,
    ShiftKey: false,
    AltKey: false,
  },
  {
    Key: 45,
    Name: "PrevFile",
    CtrlKey: true,
    ShiftKey: false,
    AltKey: false,
  },
  {
    Key: 46,
    Name: "NextFile",
    CtrlKey: true,
    ShiftKey: false,
    AltKey: false,
  },
  {
    Key: 13,
    Name: "Fullscreen",
    CtrlKey: false,
    ShiftKey: false,
    AltKey: false,
  },
  {
    Name: "Muted",
    Key: 77,
    CtrlKey: false,
    ShiftKey: false,
    AltKey: false,
  },
  {
    Key: 32,
    Name: "PlayOrPause",
    CtrlKey: false,
    ShiftKey: false,
    AltKey: false,
  },
  {
    Key: 76,
    Name: "ShowList",
    CtrlKey: true,
    ShiftKey: false,
    AltKey: false,
  },
];

export const defSortTabs = [
  {
    Name: "Home",
    SortBy: "dd",
    Items: 0,
  },
  {
    Name: "Videos",
    SortBy: "dd",
    Items: 0,
  },
  {
    Name: "Mangas",
    SortBy: "dd",
    Items: 0,
  },
  {
    Name: "Favorites",
    SortBy: "dd",
    Items: 0,
  },
  {
    Name: "Content",
    SortBy: "dd",
    Items: 0,
  },
];

export default {
  defHotkeys,
  defSortTabs,
};
