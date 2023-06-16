import fs from "fs-extra";
import { nanoid } from "nanoid";
import path from "path";

export default (sequelize, DataTypes, ImagesPath) => {
  const getFileType = ({ FilesType }) => (FilesType === "mangas" ? "Manga" : "Video");
  const getCoverPath = (name) => path.join(ImagesPath, "Folder", name + ".jpg");

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
      IsAdult: {
        type: BOOLEAN,
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
        beforeUpdate: async function (item, opt) {
          let old = item._previousDataValues.Path;
          if (opt.Name && old !== item.Path && fs.existsSync(old)) {
            //move or rename folder
            fs.moveSync(old, item.Path, { overwrite: true });

            let oldCover = getCoverPath(opt.Name);
            const Cover = getCoverPath(item.Name);
            //rename cover name
            if (fs.existsSync(oldCover) && Cover !== oldCover) {
              fs.moveSync(oldCover, Cover, { overwrite: true });
            }
            //Rename Folder for thumbnail
            if (opt.Name !== item.Name) {
              const thumbsPath = `${ImagesPath}/${getFileType(item)}/${opt.Name}`;
              if (fs.existsSync(thumbsPath)) {
                const newthumbsPath = thumbsPath.replace(opt.Name, item.Name);
                fs.moveSync(thumbsPath, newthumbsPath);
              }
            }
          }
        },
        beforeDestroy: async function (item, opt) {
          if (opt.Del) {
            let cPath = getCoverPath(item.Name);

            //Remove Cover from images
            if (fs.existsSync(cPath)) fs.removeSync(cPath);

            //Remove files Thumbnails from images folder
            const imagesFolder = `${ImagesPath}/${getFileType(item)}/${item.Name}`;
            if (fs.existsSync(imagesFolder)) fs.removeSync(imagesFolder);

            //Remove folder from disk
            if (fs.existsSync(item.Path)) fs.removeSync(item.Path);
          }
        },
      },
    }
  );

  return Folder;
};
