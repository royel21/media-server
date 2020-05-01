const { nanoid } = require("nanoid");
module.exports = (sequelize, DataTypes) => {
  const Recent = sequelize.define(
    "Recents",
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
    },
    {
      timestamps: false,
      hooks: {
        beforeValidate: function (item, options) {
          item.Id = nanoid(6);
        },
        beforeBulkCreate: (instances, options) => {
          for (var item of instances) {
            item.Id = nanoid(6);
          }
        },
      },
    }
  );

  return Recent;
};
