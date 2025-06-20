import path from "node:path";
import os from "os";

import { nanoid } from "nanoid";
import { INTEGER, STRING, VIRTUAL } from "sequelize";

export default (sequelize) => {
  const AppConfig = sequelize.define(
    "AppConfigs",
    {
      Id: {
        type: STRING(10),
        primaryKey: true,
      },
      AdminPassword: {
        type: STRING(20),
        allowNull: false,
        defaultValue: "QERtaW4xMjM=",
      },
      UserPassword: {
        type: STRING(20),
        defaultValue: "QEFiMTIzNDU=",
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
      RemoveInName: {
        type: STRING,
        defaulValue: "Manhwa|Webtoon(s|)",
        collate: "utf8mb4_bin",
      },
      AdultPath: {
        type: STRING,
        defaultValue: path.join("homedir", "Downloads", "mediaserver"),
      },
      MangaPath: {
        type: STRING,
        defaultValue: path.join("homedir", "Downloads", "mediaserver"),
      },
      CoverPath: {
        type: STRING,
        defaultValue: path.join("homedir", "images"),
      },
      ImagesPath: {
        type: VIRTUAL,
        get() {
          return this.CoverPath.replace("homedir", os.homedir());
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

  AppConfig.prototype.getPassword = function (Role) {
    const password = btoa(Role) === "QWRtaW5pc3RyYXRvcg==" ? this.AdminPassword : this.UserPassword;
    return atob(password);
  };

  return AppConfig;
};
