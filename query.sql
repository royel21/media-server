-- SELECT
--   `Id`,
--   `Name`,
--   `Cover`,
--   `Type`,
--   `FilesType`,
--   `CreatedAt`,
--   `FileCount`,
--   (
--     Select
--       FolderId
--     from FavoriteFolders
--     where
--       `Folders`.`Id` == FolderId
--       and FavoriteId IN ('lxKQb0', 'dKQHs0')
--   ) AS `isFav`
-- FROM `Folders` AS `Folders`
-- WHERE
--   `Folders`.`Name` LIKE '%%'
--   AND `Folders`.`FilesType` = 'mangas'
-- ORDER BY
--   REPLACE("Name", '[', '0')
-- LIMIT
--   0, '12';
-- delete and reset autoimcrement
-- DELETE From RecentFolders where Id > 0;
--delete from sqlite_sequence where name='RecentFolders';
SELECT
  `Folders`.`Id`,
  `Folders`.`Type`,
  `Folders`.`FilesType`,
  `Folders`.`Name`,
  `Folders`.`Cover`,
  `Folders`.`CreatedAt`,
  `Folders`.`FileCount`,
  `Folders`.`Path`,
  `Folders`.`DirectoryId`,
  `RecentFolders`.`Id` AS `RecentFolders.Id`,
  `RecentFolders`.`CurrentFile` AS `RecentFolders.CurrentFile`,
  `RecentFolders`.`LastRead` AS `RecentFolders.LastRead`,
  `RecentFolders`.`RecentId` AS `RecentFolders.RecentId`,
  `RecentFolders`.`FolderId` AS `RecentFolders.FolderId`
FROM `Folders` AS `Folders`
INNER JOIN `RecentFolders` AS `RecentFolders` ON `Folders`.`Id` = `RecentFolders`.`FolderId`
  AND `RecentFolders`.`RecentId` = 'zhNXId'
LIMIT
  1;