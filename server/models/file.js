import path from "path";
import fs from "fs-extra";
import { nanoid } from "nanoid";
import { DataTypes } from "sequelize";
import defaultConfig from "../default-config.js";

export default (sequelize, isSqlite) => {
  const genImgPath = (type, fname, name) => `${defaultConfig.ImagesDir}/${type}/${fname}/${name}.jpg`;

  const { BIGINT, STRING, DATE, FLOAT, VIRTUAL } = DataTypes;
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
        type: "VARCHAR(255)" + (isSqlite ? " " : " COLLATE 'utf8mb4_bin'"),
      },
      Path: {
        type: VIRTUAL,
        get() {
          return this.Folder ? path.join(this.Folder.Path, this.Name) : "";
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
        type: BIGINT.UNSIGNED,
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
        afterUpdate: async function (item) {
          const oldName = item._previousDataValues.Name;
          if (item.Name !== oldName) {
            const folder = await item.getFolder();
            if (folder) {
              const fromFile = path.join(folder.Path, oldName);
              const toFile = path.join(folder.Path, item.Name);
              if (fs.existsSync(fromFile) && !fs.existsSync(toFile)) {
                fs.moveSync(fromFile, toFile);
              }

              const oldCover = genImgPath(item.Type, folder.Name, oldName);
              const cover = genImgPath(item.Type, folder.Name, item.Name);
              if (fs.existsSync(oldCover) && !fs.existsSync(cover)) {
                fs.moveSync(oldCover, cover);
              }
            }
          }
        },
        beforeDestroy: async function (item, opt) {
          if (opt.Del) {
            try {
              const folder = await item.getFolder();
              if (folder) {
                //Delete File
                const fPath = `${folder.Path}/${item.Name}`;

                if (fs.existsSync(fPath)) {
                  fs.removeSync(fPath);
                }
                //Delete Cover
                const cover = genImgPath(item.Type, folder.Name, item.Name);
                if (fs.existsSync(cover)) {
                  console.log("remove", cover);
                  fs.removeSync(cover);
                }
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
