import { DataTypes } from "sequelize";

export default (sequelize, isSqlite) => {
  const { INTEGER, DATE, STRING, VIRTUAL, BOOLEAN, TEXT } = DataTypes;
  const Link = sequelize.define(
    "Links",
    {
      Id: {
        type: INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      Name: {
        type: STRING + (isSqlite ? " " : " COLLATE 'utf8mb4_bin'"),
        defaultValue: "",
      },
      UrlName: {
        type: VIRTUAL,
        get() {
          return this.Name || this.Url.split("/")[4] || this.Url.split("/")[3];
        },
      },
      AltName: {
        type: TEXT + (isSqlite ? " " : " COLLATE 'utf8mb4_unicode_ci'"),
        defaultValue: "",
      },

      Url: {
        type: STRING,
        defaultValue: "",
        unique: true,
      },
      LastChapter: {
        type: STRING,
        defaultValue: "",
      },
      Date: {
        type: DATE,
      },
      ServerId: {
        type: INTEGER,
      },
      Exclude: { type: BOOLEAN, defaultValue: false, allowNull: false },
      IsAdult: { type: BOOLEAN, defaultValue: false, allowNull: false },
      Raw: { type: BOOLEAN, defaultValue: false, allowNull: false },
      IsDownloading: { type: BOOLEAN, defaultValue: false, allowNull: false },
    },
    {
      uniqueKeys: {
        Uniq_File: {
          fields: ["Url", "ServerId"],
        },
      },
    }
  );
  return Link;
};
