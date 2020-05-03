const { nanoid } = require("nanoid");
module.exports = (sequelize, DataTypes) => {
  const { STRING, BOOLEAN } = DataTypes;

  const Directory = sequelize.define(
    "Directory",
    {
      Id: {
        type: STRING(6),
        unique: true,
        primaryKey: true,
        allowNull: false,
      },
      Name: {
        type: STRING,
        unique: true,
        allowNull: false,
      },
      FullPath: {
        type: STRING,
        unique: true,
        allowNull: false,
      },
      IsLoading: {
        type: BOOLEAN,
        defaultValue: false,
      },
    },
    {
      hooks: {
        beforeValidate: (item) => {
          item.Id = nanoid(6);
        },
      },
      timestamps: false,
    }
  );

  return Directory;
};
