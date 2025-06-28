import fs from "fs-extra";
import path from "path";
import { nanoid } from "nanoid";
import { DataTypes } from "sequelize";
import { getFileType } from "../Downloader/utils.js";

import os from "os";
const homedir = os.homedir();

export default (sequelize, db) => {
  const getCoverPath = async (basePath, name, type) => {
    return path.join(basePath, "Folder", type, name + ".jpg");
  };

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
        collate: "utf8mb4_unicode_ci",
      },
      AltName: {
        type: TEXT,
        collate: "utf8mb4_unicode_ci",
      },
      Genres: {
        type: STRING(255),
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
        collate: "utf8mb4_bin",
        unique: true,
      },
      Description: {
        type: TEXT,
        collate: "utf8mb4_unicode_ci",
      },
      Status: {
        type: BOOLEAN,
      },
      IsAdult: {
        type: BOOLEAN,
        defaultValue: 0,
      },
      Server: {
        type: STRING,
        defaultValue: "",
      },
      Scanning: {
        type: BOOLEAN,
        defaultValue: false,
      },
      Author: {
        type: STRING(100),
      },
      EmissionDate: {
        type: DATE,
      },
    },
    {
      timestamps: false,
      hooks: {
        beforeValidate: function (item) {
          item.Id = nanoid(6);
        },
        beforeBulkCreate: (instances) => {
          for (let item of instances) {
            item.Id = nanoid(6);
          }
        },
        beforeUpdate: async function (item, opt) {
          const appConfig = await db.AppConfig.findOne();

          let { Path, Name } = item._previousDataValues;
          if (Name !== item.Name && fs.existsSync(Path)) {
            const getFileType = ({ FilesType }) => (FilesType === "mangas" ? "Manga" : "Video");
            Path = Path.replace("homedir", homedir);
            item.Path = item.Path.replace("homedir", homedir);

            if (!opt.Transfer) {
              //rename folder
              fs.moveSync(Path, item.Path, { overwrite: true });
            }
            //Rename Folder for thumbnail
            const type = item.FilesType;

            const moveCover = (Path) => {
              const newPath = Path.replace(Name, item.Name);
              //rename cover name
              if (fs.existsSync(Path) && Path !== newPath) {
                fs.moveSync(Path, newPath, { overwrite: true });
              }
            };

            let oldCover = await getCoverPath(appConfig.ImagesPath, Name, type);
            moveCover(oldCover);

            oldCover = await path.join(appConfig.ImagesPath, getFileType(item), Name);
            moveCover(oldCover);
          }
        },
        beforeDestroy: async function (item, opt) {
          if (opt.Del) {
            const appConfig = await db.AppConfig.findOne();

            let cPath = await getCoverPath(appConfig.ImagesPath, item.Name, item.FilesType);

            //Remove Cover from images
            if (fs.existsSync(cPath)) fs.removeSync(cPath);

            //Remove files Thumbnails from images folder
            const imagesFolder = path.join(appConfig.ImagesPath, getFileType(item), item.Name);
            if (fs.existsSync(imagesFolder)) fs.removeSync(imagesFolder);

            //Remove folder from disk
            item.Path = item.Path.replace("homedir", homedir);
            if (fs.existsSync(item.Path)) fs.removeSync(item.Path);
          }
        },
      },
    }
  );

  return Folder;
};
