export const IndexOfUndefined = function (arr, from, dir) {
  var i = from < 0 ? 0 : from;
  while (true) {
    if (!arr[i]) {
      return i;
    }
    i += dir > 0 ? 1 : -1;
  }
};

export const scrollInView = (num) => {
  let currentimg = document.querySelectorAll(".img-current img")[num];
  if (currentimg) {
    currentimg.scrollIntoView();
  }
};

// get a list of index of empty place of the array
export const getEmptyIndex = function (arr, from, to, dir, size) {
  let index = from < 0 ? 0 : from;
  let items = [];
  while (items.length < to) {
    //check if is out of bound
    if (index > size - 1 || index < 0) break;
    // if is empty add index
    if (!arr[index]) items.push(index);
    //increase or decrease depending on direction
    index += dir > 0 ? 1 : -1;
  }
  return items;
};
