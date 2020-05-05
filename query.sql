SELECT
  `Folders`.*,
  `Favorites`.`Id` AS `Favorites.Id`,
  `Favorites->FavoriteFolders`.`Id` AS `Favorites.FavoriteFolders.Id`,
  `Favorites->FavoriteFolders`.`FavoriteId` AS `Favorites.FavoriteFolders.FavoriteId`,
  `Favorites->FavoriteFolders`.`FolderId` AS `Favorites.FavoriteFolders.FolderId`
FROM (
    SELECT
      `Folders`.`Id`,
      `Folders`.`Type`,
      `Folders`.`FilesType`,
      `Folders`.`Name`,
      `Folders`.`Cover`,
      `Folders`.`CreatedAt`,
      `Folders`.`FileCount`,
      `Folders`.`Path`,
      `Folders`.`DirectoryId`
    FROM `Folders` AS `Folders`
    WHERE
      `Folders`.`Name` LIKE \ '%%\' AND ( SELECT `FavoriteFolders`.`Id` FROM `FavoriteFolders` AS `FavoriteFolders` INNER JOIN `Favorites` AS `Favorite` ON `FavoriteFolders`.`FavoriteId` = `Favorite`.`Id` AND `Favorite`.`Id` = \'content\' WHERE (`Folders`.`Id` = `FavoriteFolders`.`FolderId`) LIMIT 1 ) IS 
NOT NULL ORDER BY REPLACE("Folder.Name", \'[\',\'0\') LIMIT NaN, \'9\') AS `Folders` INNER JOIN `FavoriteFolders` AS `Favorites->FavoriteFolders` ON `Folders`.`Id` = `Favorites->FavoriteFolders`.`FolderId` INNER JOIN `Favorites` AS `Favorites` ON `Favorites`.`Id` = `Favorites->FavoriteFolders`.`FavoriteId` AND `Favorites`.`Id` = \'content\' ORDER BY REPLACE("Folder.Name", \'[\',\'0\');