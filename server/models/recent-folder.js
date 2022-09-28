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
