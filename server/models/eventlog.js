import { DataTypes } from "sequelize";
const { INTEGER, STRING, DATE } = DataTypes;

export default (sequelize) =>
  sequelize.define("EventLogs", {
    Id: {
      type: INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    event: {
      type: STRING(25),
    },
    text: {
      type: STRING(512),
    },
    error: {
      type: STRING(512),
    },
    url: {
      type: STRING(220),
    },
    color: {
      type: STRING(25),
    },
    date: {
      type: DATE,
      defaultValue: sequelize.fn("NOW"),
    },
  });
