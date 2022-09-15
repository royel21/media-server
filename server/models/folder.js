const { nanoid } = require("nanoid");
const fs = require("fs");

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

module.exports = (sequelize, DataTypes) => {
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
          return fs.existsSync(this.Path || "");
        },
      },
      IsNoEmpty: {
        type: VIRTUAL,
        get() {
          return this.Exists && fs.readdirSync(this.Path).length;
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
          item.Cover = `/${item.Type}/${encodeURI(item.Name)}.jpg`;
        },
        beforeBulkCreate: (instances) => {
          for (var item of instances) {
            item.Id = nanoid(6);
            item.Cover = `/${item.Type}/${item.Name.replace("#", "%23")}.jpg`;
          }
        },
      },
    }
  );

  return Folder;
};
