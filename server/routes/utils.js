import db from "../models/index.js";

export const mapFilter = (f) => ({ [db.Op.like]: `%${f || ""}%` });

export const getFilter = (data) => {
  const filter = data?.replace(/’/g, "'") || "";
  const isOr = filter.includes("&");

  return {
    [db.Op[isOr ? "and" : "or"]]: filter.split(isOr ? "&" : "|").map(mapFilter),
  };
};

export const clamp = (num, min, max) => {
  return Math.min(Math.max(num, min), max) || min;
};
