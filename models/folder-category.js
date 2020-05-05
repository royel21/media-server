module.exports = (sequelize, DataTypes) => {
  const FolderCategory = sequelize.define(
    "FolderCategories",
    {
      Id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
    },
    {
      timestamps: false,
      uniqueKeys: {
        FolderCategory_unique: {
          fields: ["CategoryId", "FolderId"],
        },
      },
    }
  );

  return FolderCategory;
};
