module.exports = (sequelize, { STRING, INTEGER }) => {
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
    },
    {
      timestamps: false,
      uniqueKeys: {
        RecentFolder_unique: {
          fields: ["RecentId", "FolderId"],
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
