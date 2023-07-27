import { DataTypes } from "sequelize";

export default (sequelize) => {
  const FavoriteFolder = sequelize.define(
    "FavoriteFolders",
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
        FavoriteFolder_unique: {
          fields: ["FavoriteId", "FolderId"],
        },
      },
    }
  );

  return FavoriteFolder;
};
