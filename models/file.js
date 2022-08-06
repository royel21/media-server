const { nanoid } = require("nanoid");
module.exports = (sequelize, DataTypes) => {
  const { INTEGER, STRING, DATE, FLOAT } = DataTypes;
  const File = sequelize.define(
    "File",
    {
      Id: {
        type: STRING(10),
        primaryKey: true,
        unique: true,
        allowNull: false,
      },
      Name: {
        type: STRING,
      },
      Duration: {
        type: FLOAT(8, 2).UNSIGNED,
        defaultValue: 0,
      },
      Type: {
        type: STRING(10),
        defaultValue: "",
        allowNull: false,
      },
      Size: {
        type: INTEGER,
        allowNull: true,
      },
      CreatedAt: {
        type: DATE,
      },
      ViewCount: {
        type: INTEGER,
        defaultValue: 0,
      },
      Cover: {
        type: STRING,
      },
    },
    {
      uniqueKeys: {
        name_folderid_unique: {
          fields: ["Name", "FolderId"],
        },
      },
      timestamps: false,
      hooks: {
        beforeValidate: function (item) {
          item.Id = nanoid(10);
          // if (item.Name && item.Type && item.Type === "Video")
          //     item.Cover = `/${item.Type}/${item.Name.replace(
          //         /#|%/gi,
          //         ""
          //     )}.jpg`;
        },
        beforeBulkCreate(instances) {
          for (var item of instances) {
            item.Id = nanoid(10);
            // if (item.Name && item.Type && item.Type === "Video")
            //     item.Cover = `/${item.Type}/${item.Name.replace(
            //         /#|%/gi,
            //         ""
            //     )}.jpg`;
          }
        },
      },
    }
  );

  return File;
};
