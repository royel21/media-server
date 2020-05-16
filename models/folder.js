const { nanoid } = require("nanoid");
module.exports = (sequelize, DataTypes) => {
    const { INTEGER, STRING, DATE } = DataTypes;
    const Folder = sequelize.define(
        "Folders",
        {
            Id: {
                type: STRING(6),
                primaryKey: true,
                unique: true,
                allowNull: false,
            },
            Type: {
                type: STRING(7),
                defaultValue: "Folder",
            },
            FilesType: {
                type: STRING(10),
            },
            Name: {
                type: STRING,
            },
            Cover: {
                type: STRING,
            },
            CreatedAt: {
                type: DATE,
                allowNull: false,
            },
            FileCount: {
                type: INTEGER,
                defaultValue: 0,
            },
            Path: {
                type: STRING,
                unique: true,
            },
        },
        {
            timestamps: false,
            uniqueKeys: {
                RecentFolder_unique: {
                    fields: ["Name", "FilesType"],
                },
            },
            hooks: {
                beforeValidate: function (item) {
                    item.Id = nanoid(6);
                    item.Cover = `/${item.Type}/${encodeURI(item.Name)}.jpg`;
                },
                beforeBulkCreate: (instances) => {
                    for (var item of instances) {
                        item.Id = nanoid(6);
                        item.Cover = `/${item.Type}/${item.Name.replace("#", "%23")}.jpg`;
                    }
                },
            },
        }
    );

    return Folder;
};
