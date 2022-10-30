import path from "path";
import fs from "fs-extra";
import { nanoid } from "nanoid";

const ImagesPath = process.env.IMAGES;

export default (sequelize, DataTypes) => {
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
        type: VIRTUAL,
        get() {
          return this.Folder ? `/${this.Type}/${this.Folder.Name}/${this.Name}.jpg` : "";
        },
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
        },
        beforeBulkCreate: function (items) {
          for (var item of items) {
            item.Id = nanoid(10);
          }
        },
        beforeDestroy: async function (item, opt) {
          console.log(opt);
          if (opt.Del) {
            const folder = await item.getFolder();
            //Delete File
            const fPath = `${folder.Path}/${item.Name}`;
            if (fs.existsSync(fPath)) fs.removeSync(fPath);
            //Delete Cover
            const cover = `${ImagesPath}/${folder.Name}/${item.Name}.jpg`;
            if (fs.existsSync(cover)) fs.removeSync(cover);
          }
        },
      },
    }
  );

  return File;
};
