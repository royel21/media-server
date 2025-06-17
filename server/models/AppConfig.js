import os from "os";
import { nanoid } from "nanoid";
import { INTEGER, STRING, VIRTUAL } from "sequelize";

export default (sequelize) => {
  return sequelize.define(
    "AppConfigs",
    {
      Id: {
        type: STRING(10),
        primaryKey: true,
      },
      AdminPassword: {
        type: STRING(20),
        allowNull: false,
        defaultValue: atob("QERtaW4xMjM="),
      },
      UserPassword: {
        type: STRING(20),
        defaultValue: atob("QEFiMTIzNDU="),
        allowNull: false,
      },
      LoginTimeout: {
        type: INTEGER,
        defaultValue: 5,
      },
      LoginLockCount: {
        type: INTEGER,
        defaultValue: 3,
      },
      AdultPath: {
        type: STRING,
        defaultValue: "homedir/Downloads/mediaserver/R18",
        get() {
          const rawValue = this.getDataValue("AdultPath");
          return rawValue.replace("homedir", os.homedir());
        },
        set(value) {
          this.setDataValue("AdultPath", value.replace(os.homedir(), "homedir"));
        },
      },
      MangaPath: {
        type: STRING,
        defaultValue: "homedir/Downloads/mediaserver",
        get() {
          const rawValue = this.getDataValue("MangaPath");
          return rawValue.replace("homedir", os.homedir());
        },
        set(value) {
          this.setDataValue("MangaPath", value.replace(os.homedir(), "homedir"));
        },
      },
      CoverPath: {
        type: STRING,
        defaultValue: "homedir/images",
        get() {
          const rawValue = this.getDataValue("CoverPath");
          return rawValue.replace("homedir", os.homedir());
        },
        set(value) {
          this.setDataValue("CoverPath", value.replace(os.homedir(), "homedir"));
        },
      },
      ImagesPath: {
        type: VIRTUAL,
        get() {
          return CoverPath.replace(os.homedir(), "homedir");
        },
      },
    },
    {
      timestamps: false,
      hooks: {
        beforeValidate: (config) => {
          if (!config.Id) {
            config.Id = nanoid(10);
          }
        },
      },
    }
  );
};
