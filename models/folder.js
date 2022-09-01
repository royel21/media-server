const { nanoid } = require("nanoid");
const fs = require("fs");

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
      Exists: {
        type: VIRTUAL,
        get() {
          return fs.existsSync(this.Path);
        },
      },
      Cover: {
        type: STRING,
      },
      CreatedAt: {
        type: DATE,
        allowNull: false,
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
        type: TEXT,
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
