import { Op } from "sequelize";

export const mapFilter = (f) => ({ [Op.like]: `%${f || ""}%` });

export const getFilter = (data) => {
  const filter = data?.replace(/’/g, "'").replace("\\", "\\\\") || "";
  const isOr = filter.includes("&");

  return {
    [Op[isOr ? "and" : "or"]]: filter.split(/&|\|/g).map(mapFilter),
  };
};

export const getFilter2 = (data, names = []) => {
  const filter = data?.replace(/’/g, "'").replace("\\", "\\\\") || "";
  const isOr = filter.includes("&");

  let obj = {};
  names.forEach((m) => (obj[m] = ""));

  let filters = [];

  const op = Op[isOr ? "and" : "or"];

  const parts = filter.split(/&|\|/g);
  for (const part of parts) {
    if (part.indexOf("=") > -1) {
      const p = part.split("=");
      obj[p[0]] = { [op]: mapFilter(p[1]) };
    } else {
      filters.push(mapFilter(part));
    }
  }

  for (const key of Object.keys(obj)) {
    if (!obj[key]) {
      obj[key] = { [op]: filters };
    }
  }
  //maria|server=https://www.mangaread.org/manga/solo-leveling-manhwa
  return obj;
};

export const clamp = (num, min, max) => {
  return Math.min(Math.max(num, min), max) || min;
};

export const formatLink = (link) => {
  const linkParts = link.split("/");
  const serverName = linkParts[2].replace(/www\.|\.html/i, "");

  const end = linkParts[linkParts.length - 1];
  if (/^(chap|\d+$)/i.test(end) || end === "") {
    linkParts.pop();
  }

  return { url: linkParts.join("/"), serverName };
};
