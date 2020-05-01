const { nanoid } = require("nanoid");
module.exports = (sequelize, DataTypes) => {
  const { STRING } = DataTypes;

  const Category = sequelize.define(
    "Category",
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
      },
    },
    {
      timestamps: false,
      hooks: {
        beforeCreate: function (item) {
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
  return Category;
};
