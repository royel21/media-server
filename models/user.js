"use strict";

const bcrypt = require("bcrypt");
const { nanoid } = require("nanoid");
module.exports = (sequelize, DataTypes) => {
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
        },
        {
            timestamps: false,
            hooks: {
                beforeValidate: (user) => {
                    if (!user.Id) {
                        user.Id = nanoid(10);
                    }
                },
                beforeCreate: (user) => {
                    user.Password = bcrypt.hashSync(
                        user.Password,
                        bcrypt.genSaltSync(8),
                        null
                    );
                    user.CreatedAt = new Date();
                },
                beforeUpdate: (user, opt) => {
                    if (opt.fields.includes("Password")) {
                        user.Password = bcrypt.hashSync(
                            user.Password,
                            bcrypt.genSaltSync(8),
                            null
                        );
                    }
                },
                beforeBulkCreate: (users) => {
                    for (var user of users) {
                        user.Id = nanoid(10);
                        user.Password = bcrypt.hashSync(
                            user.Password,
                            bcrypt.genSaltSync(8),
                            null
                        );
                        user.CreatedAt = new Date();
                    }
                },
            },
        }
    );

    User.prototype.validPassword = function (password) {
        return new Promise((resolve, rejected) => {
            bcrypt.compare(password, this.Password, (err, result) => {
                if (err) rejected(err);
                resolve(result);
            });
        });
    };
    return User;
};
