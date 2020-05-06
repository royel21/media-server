SELECT
  `Id`,
  `Name`,
  `Cover`,
  `Type`,
  `FilesType`,
  `CreatedAt`,
  `FileCount`,
  (
    Select
      FolderId
    from FavoriteFolders
    where
      `Folders`.`Id` == FolderId
      and FavoriteId IN ('lxKQb0', 'dKQHs0')
  ) AS `isFav`
FROM `Folders` AS `Folders`
WHERE
  `Folders`.`Name` LIKE '%%'
  AND `Folders`.`FilesType` = 'mangas'
ORDER BY
  REPLACE("Name", '[', '0')
LIMIT
  0, '12';