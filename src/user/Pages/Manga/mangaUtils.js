export const scrollInView = (num) => document.querySelectorAll(".img-current img")[num]?.scrollIntoView();

// get a list of index of empty place of the array

export const getEmptyIndex = function (arr, from, count, dir) {
  let index = Math.max(0, from);
  let items = [];
  while (items.length < count && index > 0) {
    if (arr[index] === undefined) {
      items.push(index);
    }
    index += dir;
  }
  return items;
};
