import { readdirSync, existsSync } from "fs";
import { nanoid } from "nanoid";

export default (sequelize, DataTypes) => {
  const { INTEGER, STRING, DATE, TEXT, BOOLEAN, VIRTUAL } = DataTypes;
  const Folder = sequelize.define(
    "Folders",
    {
      Id: {
        type: STRING(6),
        primaryKey: true,
        unique: true,
        allowNull: false,
      },
      Type: {
        type: STRING(7),
        defaultValue: "Folder",
      },
      FilesType: {
        type: STRING(10),
      },
      Name: {
        type: STRING,
      },
      Genres: {
        type: STRING(150),
        defaultValue: "",
      },
      Exists: {
        type: VIRTUAL,
        get() {
          return existsSync(this.Path || "");
        },
      },
      IsNoEmpty: {
        type: VIRTUAL,
        get() {
          return this.Exists && readdirSync(this.Path).length;
        },
      },
      Cover: {
        type: VIRTUAL,
        get() {
          return `/Folder/${this.Name}.jpg`;
        },
      },
      CreatedAt: {
        type: DATE,
        allowNull: false,
      },
      LastModified: {
        type: VIRTUAL,
        get() {
          return this.CreatedAt?.toISOString();
        },
      },
      FileCount: {
        type: INTEGER,
        defaultValue: 0,
      },
      Path: {
        type: STRING,
        unique: true,
      },
      Description: {
        type: TEXT + "COLLATE 'utf8mb4_bin'",
      },
      Status: {
        type: BOOLEAN,
      },
      IsAdult: {
        type: INTEGER,
        defaultValue: 0,
      },
    },
    {
      timestamps: false,
      uniqueKeys: {
        folder_unique: {
          fields: ["Name", "DirectoryId"],
        },
      },
      hooks: {
        beforeValidate: function (item) {
          item.Id = nanoid(6);
        },
        beforeBulkCreate: (instances) => {
          for (var item of instances) {
            item.Id = nanoid(6);
          }
        },
      },
    }
  );

  return Folder;
};
