export const scrollInView = (num) => document.querySelectorAll(".img-current img")[num]?.scrollIntoView();

// get a list of index of empty place of the array
export const getEmptyIndex = function (arr, from, count, dir, max) {
  let index = Math.max(0, from);
  let items = [];

  let c = 0;
  while (items.length < count && index < max) {
    if (arr[index] === undefined) {
      items.push(index);
    }
    index += dir;
    if (c++ === count) break;
  }
  return items;
};
