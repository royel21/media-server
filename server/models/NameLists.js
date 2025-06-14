import { DataTypes } from "sequelize";

export default (sequelize, isSqlite) => {
  const { INTEGER, STRING } = DataTypes;
  return sequelize.define("NameLists", {
    Id: {
      type: INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    Name: {
      type: STRING + (isSqlite ? " " : " COLLATE 'utf8mb4_unicode_ci'"),
      unique: true,
      defaultValue: "",
    },
    AltName: {
      type: STRING + (isSqlite ? " " : " COLLATE 'utf8mb4_unicode_ci'"),
      defaultValue: "",
    },
  });
};
