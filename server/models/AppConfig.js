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
        defaultValue: "@Dmin123",
      },
      UserPassword: {
        type: STRING(20),
        defaultValue: "@Ab12345",
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
