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
      defaultValue: "",
    },
    AltName: {
      type: STRING,
      defaultValue: "",
    },
  });
};
