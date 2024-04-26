import path from "path";
import fs from "fs-extra";
import { nanoid } from "nanoid";
import { DataTypes } from "sequelize";
import defaultConfig from "../default-config.js";

export default (sequelize) => {
  const genImgPath = (type, fname, name) => `${defaultConfig.ImagesDir}/${type}/${fname}/${name}.jpg`;

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
      Cover: {
        type: VIRTUAL,
        get() {
          return this.Folder ? `/${this.Type}/${this.Folder.Name}/${this.Name}.jpg` : "";
        },
      },
      FolderId: {
        type: STRING(6),
      },
    },
    {
      indexes: [
        {
          unique: false,
          fields: ["FolderId"],
        },
      ],
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
          for (let item of items) {
            item.Id = nanoid(10);
          }
        },
        beforeUpdate: async function (item) {
          const oldName = item._previousDataValues.Name;
          if (item.Name !== oldName) {
            const folder = await item.getFolder();
            if (folder) {
              const fromFile = path.join(folder.Path, oldName);
              if (fs.existsSync(fromFile)) {
                const toFile = path.join(folder.Path, item.Name);
                fs.moveSync(fromFile, toFile);
              }

              const oldCover = genImgPath(item.Type, folder.Name, oldName);
              if (fs.existsSync(oldCover)) {
                const cover = genImgPath(item.Type, folder.Name, item.Name);
                fs.moveSync(oldCover, cover);
              }
            }
          }
        },
        beforeDestroy: async function (item, opt) {
          if (opt.Del) {
            try {
              const folder = await item.getFolder();
              console.log("folder: ", folder?.Name);
              if (folder) {
                //Delete File
                const fPath = `${folder.Path}/${item.Name}`;
                if (fs.existsSync(fPath)) fs.removeSync(fPath);
                //Delete Cover
                const cover = genImgPath(item.Type, folder.Name, item.Name);
                console.log("remove", cover);
                if (fs.existsSync(cover)) fs.removeSync(cover);
              }
            } catch (error) {
              console.log(error);
            }
          }
        },
      },
    }
  );

  return File;
};
