import { DataTypes } from "sequelize";

export default (sequelize) => {
  const { INTEGER, STRING } = DataTypes;
  return sequelize.define("NameLists", {
    Id: {
      type: INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    Name: {
      type: STRING,
      unique: true,
      collate: "utf8mb4_unicode_ci",
      defaultValue: "",
    },
    AltName: {
      type: STRING,
      collate: "utf8mb4_unicode_ci",
      defaultValue: "",
    },
  });
};
