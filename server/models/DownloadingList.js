import { DataTypes } from "sequelize";
const { INTEGER, STRING } = DataTypes;

export default (sequelize) =>
  sequelize.define("DownloadingLists", {
    Id: {
      type: INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    Name: {
      type: STRING,
      unique: true,
    },
  });
