import { DataTypes } from "sequelize";

export default (sequelize) => {
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
        type: STRING,
        defaultValue: "",
      },
      LinkName: {
        type: STRING,
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
