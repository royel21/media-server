module.exports = (sequelize, DataTypes) => {
  const FavoriteFile = sequelize.define(
    "FavoriteFolder",
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
        FavoriteFile_unique: {
          fields: ["FavoriteId", "FolderId"],
        },
      },
    }
  );

  return FavoriteFile;
};
