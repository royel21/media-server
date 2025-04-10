import { getFilesPerPage, ProcessFile } from "../Pages/filesUtils";
const UP = 38;
const DOWN = 40;
const LEFT = 37;
const RIGHT = 39;
const ENTER = 13;
const HOME = 36;
const END = 35;
let selectedIndex = 0;

//LocalStorage
Storage.prototype.setObject = function (key, value) {
  this.setItem(key, JSON.stringify(value));
};
//get object fron LocalStorage

Storage.prototype.getObject = function (key) {
  return JSON.parse(this.getItem(key) || "{}");
};

const calCol = () => {
  let file = document.querySelector(".file");
  return Math.floor(file.parentElement.offsetWidth / file.offsetWidth);
};

const getElByIndex = (index) => {
  return [...document.querySelectorAll(".file")][index];
};

const getElIndex = (element) => {
  return [...document.querySelectorAll(".file")].indexOf(element);
};

export const scrollItem = (element, behavior = "auto") => {
  if (!element) return;

  let itemContainer = element.parentElement;
  let scrollElement = itemContainer.parentElement;
  let scroll = scrollElement.scrollTop;
  let el_offsetTop = element.offsetTop;

  if (el_offsetTop - scroll < 15) {
    scroll = el_offsetTop - 15;
  }

  let elHeight = (element.querySelector(".file-info") || element).offsetHeight + 45;
  let top = el_offsetTop + elHeight;
  let sctop = scroll + scrollElement.offsetHeight;

  if (top - sctop + 1 > 0) {
    scroll = scroll + (top - sctop);
  }

  scrollElement.scroll({
    top: scroll,
    behavior,
  });
};

const selectElement = (element) => {
  if (element) {
    document.querySelector(".file.active")?.classList.remove("active");
    element.classList.add("active");
    scrollItem(element);
  }
  return element;
};

const selectItem = (index) => {
  selectedIndex = index;
  selectElement(getElByIndex(index));
};

const StoreKey = window.localStorage.getItem("user") + "-FolderIds";

const StoreId = window.localStorage.getObject(StoreKey);
export const saveId = (title, id) => {
  if (title && id) {
    StoreId[title] = id;
    window.localStorage.setObject(StoreKey, StoreId);
  }
};

export const getId = (title) => StoreId[title];

const selectElementById = (Id, saveKey) => {
  const el = document.getElementById(Id);
  if (el) selectElement(el);
  saveId(saveKey, Id);
};

const selectByTitle = (title) => {
  const id = getId(title);
  const element = document.getElementById(id);
  if (element) {
    selectElement(element);
  } else {
    selectItem(0);
  }
  document.querySelector(".files-list")?.focus();
};

const fileKeypress = (e, page, goToPage, title, type) => {
  let file = document.querySelector(".file.active");
  let selected = 0;

  if (file) {
    let wasProcesed = false;
    let colNum = calCol();
    let totalitem = document.querySelectorAll(".file").length;
    selectedIndex = getElIndex(file);

    switch (e.keyCode) {
      case ENTER: {
        if (title !== "Content") {
          wasProcesed = true;
          ProcessFile(file, type);
        }
        break;
      }
      case LEFT: {
        if (selectedIndex > 0) {
          selectItem(selectedIndex - 1);
        } else if (goToPage) {
          selected = getFilesPerPage(3) - 1;
          goToPage({ detail: page - 1 }, selected);
        }

        wasProcesed = true;
        break;
      }
      case UP: {
        if (goToPage && e.ctrlKey) {
          selected = getFilesPerPage(3) - 1;
          goToPage({ detail: page - 1 }, selected);
        } else if (selectedIndex - colNum >= 0) {
          selectItem(selectedIndex - colNum);
        }
        wasProcesed = true;
        break;
      }
      case RIGHT: {
        if (selectedIndex < totalitem - 1) {
          selectItem(selectedIndex + 1);
        } else if (goToPage) {
          goToPage({ detail: parseInt(page) + 1 }, 0);
        }

        wasProcesed = true;
        break;
      }

      case DOWN: {
        if (goToPage && e.ctrlKey) {
          goToPage({ detail: parseInt(page) + 1 }, 0);
        } else if (selectedIndex + colNum < totalitem) {
          selectItem(selectedIndex + colNum);
        }
        wasProcesed = true;
        break;
      }
      case HOME: {
        selectItem(0);
        wasProcesed = true;
        break;
      }
      case END: {
        selectItem(totalitem - 1);
        wasProcesed = true;
        break;
      }
      default: {
      }
    }

    if (wasProcesed) {
      e.preventDefault();
      e.stopPropagation();
      const active = file.parentElement.querySelector(".active");
      if (active && title) {
        saveId(title, active.id);
      }
    }
  }
};

export { fileKeypress, selectItem, getElIndex, selectElementById, selectByTitle };
