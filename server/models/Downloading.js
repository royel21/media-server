import { DataTypes } from "sequelize";
const { INTEGER } = DataTypes;

export default (sequelize) =>
  sequelize.define(
    "Downloadings",
    {
      Id: {
        type: INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      LinkId: {
        type: INTEGER,
      },
      DownloadingListId: {
        type: INTEGER,
      },
    },
    {
      uniqueKeys: {
        name_link_exclude: {
          fields: ["LinkId", "DownloadingListId"],
        },
      },
    }
  );
