const db = require("../models");

const mapFilter = (f) => ({ [db.Op.like]: `%${f || ""}%` });

const getFilter = (filter) => {
  const isOr = filter.includes("|");

  return {
    [db.Op[isOr ? "or" : "and"]]: filter.split(isOr ? "|" : "&").map(mapFilter),
  };
};

module.exports = {
  getFilter,
};
