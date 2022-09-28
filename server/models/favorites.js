import { nanoid } from "nanoid";

export default (sequelize, DataTypes) => {
  const { STRING } = DataTypes;
  const Favorite = sequelize.define(
    "Favorite",
    {
      Id: {
        type: STRING(6),
        primaryKey: true,
        unique: true,
        allowNull: false,
      },
      Name: {
        type: STRING(100),
        unique: "compositeIndex",
        allowNull: false,
      },
      UserId: {
        type: STRING(10),
        unique: "compositeIndex",
      },
    },
    {
      timestamps: false,
      hooks: {
        beforeValidate: (item) => {
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

  return Favorite;
};
