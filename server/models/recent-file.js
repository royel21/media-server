export default (sequelize, DataTypes) => {
  const RecentFile = sequelize.define(
    "RecentFiles",
    {
      Id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      LastRead: {
        type: DataTypes.DATE,
      },
      LastPos: {
        type: DataTypes.FLOAT(8, 2).UNSIGNED,
        defaultValue: 0,
      },
      FileId: {
        type: DataTypes.STRING(10),
      },
      UserId: {
        type: DataTypes.STRING(10),
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
        beforeCreate: (item, options) => {
          item.LastRead = new Date();
        },
      },
    }
  );

  return RecentFile;
};
