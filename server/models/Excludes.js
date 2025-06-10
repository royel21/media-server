import { DataTypes } from "sequelize";

export default (sequelize, isSqlite) => {
  const { INTEGER, STRING } = DataTypes;
  return sequelize.define(
    "Excludes",
    {
      Id: {
        type: INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      Name: {
        type: STRING + (isSqlite ? " " : " COLLATE 'utf8mb4_unicode_ci'"),
        defaultValue: "",
      },
      LinkName: {
        type: STRING + (isSqlite ? " " : " COLLATE 'utf8mb4_unicode_ci'"),
      },
    },
    {
      uniqueKeys: {
        name_link_exclude: {
          fields: ["Name", "LinkName"],
        },
      },
    }
  );
};
