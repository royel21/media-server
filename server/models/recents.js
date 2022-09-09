const { nanoid } = require("nanoid");
module.exports = (sequelize, { STRING }) => {
  const Recent = sequelize.define(
    "Recents",
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
    },
    {
      timestamps: false,
      hooks: {
        beforeValidate: function (item) {
          item.Id = nanoid(6);
        },
        beforeBulkCreate: (instances) => {
          for (var item of instances) {
            item.Id = nanoid(6);
          }
        },
      },
    }
  );

  return Recent;
};
