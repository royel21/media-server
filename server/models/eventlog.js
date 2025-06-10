import { DataTypes, literal } from "sequelize";
const { INTEGER, STRING, DATE, BOOLEAN } = DataTypes;

export default (sequelize, isSqlite) =>
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
      type: STRING(512) + (isSqlite ? " " : " COLLATE 'utf8mb4_bin'"),
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
    important: {
      type: BOOLEAN,
      defaultValue: 0,
    },
    date: {
      type: DATE,
      defaultValue: literal("CURRENT_TIMESTAMP"),
    },
  });
