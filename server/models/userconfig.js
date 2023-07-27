import { nanoid } from "nanoid";
import { DataTypes } from "sequelize";

export default (sequelize) => {
  const { STRING, TEXT } = DataTypes;
  const UserConfig = sequelize.define(
    "UserConfigs",
    {
      Id: {
        type: STRING(6),
        primaryKey: true,
        unique: true,
        allowNull: false,
      },
      Name: {
        type: STRING(100),
        unique: true,
        allowNull: false,
      },
      Config: {
        type: TEXT,
        allowNull: true,
      },
    },
    {
      timestamps: false,
      hooks: {
        beforeValidate: function (item, options) {
          if (!item.Id) item.Id = nanoid(6);
        },
        beforeBulkCreate: (instances, options) => {
          for (var item of instances) {
            item.Id = nanoid(10);
          }
        },
      },
    }
  );

  return UserConfig;
};
