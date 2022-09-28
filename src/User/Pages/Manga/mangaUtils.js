export const scrollInView = (num) => document.querySelectorAll(".img-current img")[num]?.scrollIntoView();

// get a list of index of empty place of the array
export const getEmptyIndex = function (arr, from, to, dir = 1, size) {
  const pos = Math.max(0, from);
  let index = pos;
  let items = [];

  while (index != pos + to * dir) {
    //check if is out of bound
    if (index > size - 1 || index < 0) break;
    // if is empty add index
    if (!arr[index]) {
      items.push(index);
    }
    //increase or decrease depending on direction
    index += dir;
  }
  return items;
};
