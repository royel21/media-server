import { DataTypes } from "sequelize";

export default (sequelize) => {
  const { STRING, INTEGER, BOOLEAN } = DataTypes;
  const Genres = sequelize.define(
    "Genres",
    {
      Id: {
        type: INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      Name: {
        type: STRING,
        unique: true,
      },
      IsRemove: {
        type: BOOLEAN,
        defaultValue: false,
      },
    },
    {
      timestamps: false,
    }
  );

  return Genres;
};
