export const getLastChap = (chap, type, count) => {
  if (/^\d+(-\d+|)/.test(chap) && type === "mangas") {
    return chap.match(/\d+(-\d+|)/)[0];
  }

  return count;
};

const dateFormat = { year: "numeric", month: "short", day: "numeric" };

export const getDate = (d) => {
  const curDate = d.EmissionDate || d.CreatedAt;
  const nDate = new Date(curDate || "");
  if (nDate.toString() !== "Invalid Date") {
    return nDate.toLocaleDateString("en-us", dateFormat);
  }

  return "";
};
