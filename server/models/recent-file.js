import { DataTypes } from "sequelize";

export default (sequelize) => {
  const { INTEGER, STRING, FLOAT } = DataTypes;
  const RecentFile = sequelize.define(
    "RecentFiles",
    {
      Id: {
        type: INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      LastPos: {
        type: FLOAT(8, 2).UNSIGNED,
        defaultValue: 0,
      },
      FileId: {
        type: STRING(10),
      },
      UserId: {
        type: STRING(10),
      },
    },
    {
      timestamps: false,
      uniqueKeys: {
        RecentFile_unique: {
          fields: ["UserId", "FileId"],
        },
      },
      hooks: {
        beforeCreate: (item) => {
          if (!item.LastRead) {
            item.LastRead = new Date();
          }
        },
      },
    }
  );

  return RecentFile;
};
