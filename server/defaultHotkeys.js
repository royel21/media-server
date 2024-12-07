export const defHotkeys = [
  {
    Key: 13,
    Name: "Open",
    CtrlKey: false,
    ShiftKey: false,
    AltKey: false,
    Type: 1,
  },
  {
    Key: 88,
    Name: "Exit",
    CtrlKey: false,
    ShiftKey: false,
    AltKey: false,
    Type: 1,
  },
  {
    Key: 33,
    Name: "Next Tab",
    CtrlKey: false,
    ShiftKey: false,
    AltKey: false,
    Type: 1,
  },
  {
    Key: 34,
    Name: "Prev Tab",
    CtrlKey: false,
    ShiftKey: false,
    AltKey: false,
    Type: 1,
  },
  {
    Key: 67,
    Name: "Continue Reading",
    CtrlKey: false,
    ShiftKey: false,
    AltKey: false,
    Type: 2,
  },
  {
    Key: 37,
    Name: "SkipBack",
    CtrlKey: false,
    ShiftKey: false,
    AltKey: false,
    Type: 3,
  },

  {
    Key: 39,
    Name: "SkipForward",
    CtrlKey: false,
    ShiftKey: false,
    AltKey: false,
    Type: 3,
  },
  {
    Name: "FastBackward",
    Key: 37,
    CtrlKey: true,
    ShiftKey: false,
    AltKey: false,
    action: null,
    Type: 5,
  },
  {
    Name: "FastForward",
    Key: 39,
    CtrlKey: true,
    ShiftKey: false,
    AltKey: false,
    action: null,
    Type: 5,
  },
  {
    Key: 37,
    Name: "GotoStart",
    CtrlKey: true,
    ShiftKey: false,
    AltKey: false,
    Type: 4,
  },
  {
    Key: 39,
    Name: "GotoEnd",
    CtrlKey: true,
    ShiftKey: false,
    AltKey: false,
    Type: 4,
  },
  {
    Key: 45,
    Name: "PrevFile",
    CtrlKey: true,
    ShiftKey: false,
    AltKey: false,
    Type: 3,
  },
  {
    Key: 46,
    Name: "NextFile",
    CtrlKey: true,
    ShiftKey: false,
    AltKey: false,
    Type: 3,
  },
  {
    Key: 13,
    Name: "Fullscreen",
    CtrlKey: false,
    ShiftKey: false,
    AltKey: false,
    Type: 3,
  },
  {
    Name: "Muted",
    Key: 77,
    CtrlKey: false,
    ShiftKey: false,
    AltKey: false,
    Type: 5,
  },
  {
    Key: 32,
    Name: "PlayOrPause",
    CtrlKey: false,
    ShiftKey: false,
    AltKey: false,
    Type: 5,
  },
  {
    Key: 76,
    Name: "ShowList",
    CtrlKey: true,
    ShiftKey: false,
    AltKey: false,
    Type: 3,
  },
  {
    Key: 65,
    Name: "ToggleControlBar",
    CtrlKey: false,
    ShiftKey: false,
    AltKey: false,
    Type: 4,
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