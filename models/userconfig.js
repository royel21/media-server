const { nanoid } = require("nanoid");
module.exports = (sequelize, DataTypes) => {
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
        type: DataTypes.JSON,
        allowNull: true,
      },
    },
    {
      timestamps: false,
      hooks: {
        beforeValidate: function (item, options) {
          if (!item.Id) item.Id = nanoid(10);
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
