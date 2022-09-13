const { nanoid } = require("nanoid");
const path = require("path");
const fs = require("fs");

module.exports = (sequelize, DataTypes) => {
  const { INTEGER, STRING, DATE, FLOAT, VIRTUAL } = DataTypes;
  const File = sequelize.define(
    "File",
    {
      Id: {
        type: STRING(10),
        primaryKey: true,
        unique: true,
        allowNull: false,
      },
      Name: {
        type: STRING,
      },
      Path: {
        type: VIRTUAL,
        get() {
          return path.join(this?.Folder.Path || "", this.Name);
        },
      },
      Exists: {
        type: VIRTUAL,
        get() {
          return fs.existsSync(this.Path);
        },
      },
      Duration: {
        type: FLOAT(8, 2).UNSIGNED,
        defaultValue: 0,
      },
      Type: {
        type: STRING(10),
        defaultValue: "",
        allowNull: false,
      },
      Size: {
        type: INTEGER,
        allowNull: true,
      },
      CreatedAt: {
        type: DATE,
      },
      ViewCount: {
        type: INTEGER,
        defaultValue: 0,
      },
      Cover: {
        type: STRING,
      },
    },
    {
      uniqueKeys: {
        name_folderid_unique: {
          fields: ["Name", "FolderId"],
        },
      },
      timestamps: false,
      hooks: {
        beforeValidate: function (item) {
          item.Id = nanoid(10);
          if (item.Cover?.includes("\\")) {
            item.Cover = item.Cover?.replace(/\\/gi, "/");
          }
        },
        beforeBulkCreate(instances) {
          for (var item of instances) {
            item.Id = nanoid(10);
            if (item.Cover?.includes("\\")) {
              item.Cover = item.Cover?.replace(/\\/gi, "/");
            }
          }
        },
      },
    }
  );

  return File;
};
