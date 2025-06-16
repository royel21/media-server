"use strict";
import { compareSync, hashSync, genSaltSync } from "bcrypt";
import { nanoid } from "nanoid";
import { DataTypes, INTEGER, literal } from "sequelize";

export default (sequelize) => {
  const { STRING, DATE, BOOLEAN } = DataTypes;
  const User = sequelize.define(
    "User",
    {
      Id: {
        type: STRING(10),
        primaryKey: true,
      },
      Name: {
        type: STRING(100),
        unique: true,
        allowNull: false,
      },
      Password: {
        type: STRING(64),
        allowNull: false,
      },
      Role: {
        type: STRING(20),
        defaultValue: "User",
        allowNull: false,
      },
      State: {
        type: STRING(12),
        defaultValue: "Active",
        allowNull: false,
      },
      AdultPass: {
        type: BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      CreatedAt: {
        type: DATE,
      },
      LoginCount: {
        type: INTEGER,
        defaultValue: 0,
      },
      LastLogin: {
        type: DATE,
        defaultValue: literal("CURRENT_TIMESTAMP"),
      },
    },
    {
      timestamps: false,
      hooks: {
        beforeValidate: (user) => {
          if (!user.Id) {
            user.Id = nanoid(10);
          }
        },
        beforeCreate: (user, opt) => {
          if (opt.encript) {
            user.Password = hashSync(user.Password, genSaltSync(8), null);
          }
          user.CreatedAt = new Date();
        },
        beforeUpdate: (user, opt) => {
          if (opt.encript) {
            user.Password = hashSync(user.Password, genSaltSync(8), null);
          }
        },
        beforeBulkCreate: (users, opt) => {
          for (let user of users) {
            user.Id = nanoid(10);
            if (opt.encript) {
              user.Password = hashSync(user.Password, genSaltSync(8), null);
            }
            user.CreatedAt = new Date();
          }
        },
      },
    }
  );

  User.prototype.validPassword = function (password) {
    return compareSync(password, this.Password);
  };

  return User;
};
