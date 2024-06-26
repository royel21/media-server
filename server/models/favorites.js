import { nanoid } from "nanoid";
import { DataTypes } from "sequelize";

export default (sequelize) => {
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
          for (let item of instances) {
            item.Id = nanoid(6);
          }
        },
      },
    }
  );

  return Favorite;
};
