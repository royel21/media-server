export const getLastChap = (chap, type, count) => {
  if (/\d+(-\d+|)/.test(chap) && type === "mangas") {
    return chap.match(/\d+(-\d+|)/)[0];
  }

  return count;
};
