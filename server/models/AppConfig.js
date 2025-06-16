import { nanoid } from "nanoid";
import { DataTypes, INTEGER } from "sequelize";

export default (sequelize) => {
  const { STRING } = DataTypes;
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
      },
      MangaPath: {
        type: STRING,
      },
      CoverPath: {
        type: STRING,
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
