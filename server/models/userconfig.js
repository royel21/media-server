import { nanoid } from "nanoid";

export default (sequelize, DataTypes) => {
  const UserConfig = sequelize.define(
    "UserConfigs",
    {
      Id: {
        type: DataTypes.STRING(6),
        primaryKey: true,
        unique: true,
        allowNull: false,
      },
      Name: {
        type: DataTypes.STRING(100),
        unique: true,
        allowNull: false,
      },
      Config: {
        type: DataTypes.TEXT,
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
