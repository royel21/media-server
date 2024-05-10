import { Op } from "sequelize";
import db from "../models/index.js";

export const mapFilter = (f) => ({ [Op.like]: `%${f || ""}%` });

export const getFilter = (data) => {
  const filter = data?.replace(/’/g, "'") || "";
  const isOr = filter.includes("&");

  return {
    [Op[isOr ? "and" : "or"]]: filter.split(/&|\|/g).map(mapFilter),
  };
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
