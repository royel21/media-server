import db from "../models/index.js";

export const mapFilter = (f) => ({ [db.Op.like]: `%${f || ""}%` });

export const getFilter = (data) => {
  const filter = data || "";
  const isOr = filter.includes("&");

  return {
    [db.Op[isOr ? "and" : "or"]]: filter.split(isOr ? "&" : "|").map(mapFilter),
  };
};
