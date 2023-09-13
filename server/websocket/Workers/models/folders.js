import { nanoid } from "nanoid";
import fs from "fs";

Date.prototype.addHours = function (h) {
  this.setTime(this.getTime() + h * 60 * 60 * 1000);
  return this;
};

Date.prototype.subHours = function (h) {
  this.setTime(this.getTime() - h * 60 * 60 * 1000);
  return this;
};

Date.prototype.Compare = function (d) {
  d = new Date(d);
  if (d instanceof Date) {
    return this.getTime() == d.getTime();
  }
};

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
      AltName: {
        type: TEXT,
      },
      Genres: {
        type: STRING(255),
        defaultValue: "",
      },
      Exists: {
        type: VIRTUAL,
        get() {
          return fs.existsSync(this.Path);
        },
      },
      IsNoEmpty: {
        type: VIRTUAL,
        get() {
          return this.Exists && fs.readdirSync(this.Path).length;
        },
      },
      CreatedAt: {
        type: DATE,
        allowNull: false,
      },
      LastModified: {
        type: VIRTUAL,
        get() {
          return this.CreatedAt.toISOString();
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
      Server: {
        type: STRING,
        defaultValue: "",
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
