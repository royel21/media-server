export default (sequelize, { STRING, INTEGER, DATE }) => {
  const RecentFolder = sequelize.define(
    "RecentFolders",
    {
      Id: {
        type: INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      CurrentFile: {
        type: STRING(10),
      },
      LastRead: {
        type: DATE,
      },
      FolderId: {
        type: STRING(10),
      },
      UserId: {
        type: STRING(10),
      },
    },
    {
      timestamps: false,
      uniqueKeys: {
        RecentFolder_unique: {
          fields: ["UserId", "FolderId"],
        },
      },
      hooks: {
        beforeCreate: (item, options) => {
          item.LastRead = new Date();
        },
      },
    }
  );

  return RecentFolder;
};
