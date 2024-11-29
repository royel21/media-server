import { DataTypes } from "sequelize";

export default (sequelize) => {
  const { STRING, INTEGER } = DataTypes;
  const SortTab = sequelize.define(
    "SortTabs",
    {
      Id: {
        type: INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      Name: {
        type: STRING(100),
        allowNull: false,
      },
      SortBy: {
        type: STRING(100),
        allowNull: false,
        defaultValue: "nd",
      },

      Items: {
        type: INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
    },
    {
      timestamps: false,
    }
  );

  return SortTab;
};
