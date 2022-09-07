SELECT
    `Recents`.*,
    `Folders`.`Id` AS `Folders.Id`,
    `Folders`.`Type` AS `Folders.Type`,
    `Folders`.`FilesType` AS `Folders.FilesType`,
    `Folders`.`Name` AS `Folders.Name`,
    `Folders`.`Cover` AS `Folders.Cover`,
    `Folders`.`CreatedAt` AS `Folders.CreatedAt`,
    `Folders`.`FileCount` AS `Folders.FileCount`,
    `Folders`.`Path` AS `Folders.Path`,
    `Folders`.`Description` AS `Folders.Description`,
    `Folders`.`Status` AS `Folders.Status`,
    `Folders`.`DirectoryId` AS `Folders.DirectoryId`,
    `Folders->RecentFolders`.`Id` AS `Folders.RecentFolders.Id`,
    `Folders->RecentFolders`.`CurrentFile` AS `Folders.RecentFolders.CurrentFile`,
    `Folders->RecentFolders`.`LastRead` AS `Folders.RecentFolders.LastRead`,
    `Folders->RecentFolders`.`RecentId` AS `Folders.RecentFolders.RecentId`,
    `Folders->RecentFolders`.`FolderId` AS `Folders.RecentFolders.FolderId`
FROM (
        SELECT
            `Recents`.`Id`,
            `Recents`.`Name`,
            `Recents`.`UserId`
        FROM
            `Recents` AS `Recents`
        WHERE
            `Recents`.`Id` = '2dSopX'
        ORDER BY
            `Folders.RecentFolders.LastRead` DESC
        LIMIT
            0, 50
    ) AS `Recents`
    LEFT OUTER JOIN (
        `RecentFolders` AS `Folders->RecentFolders`
        INNER JOIN `Folders` AS `Folders` ON `Folders`.`Id` = `Folders->RecentFolders`.`FolderId`
    ) ON `Recents`.`Id` = `Folders->RecentFolders`.`RecentId`
ORDER BY
    `Folders.RecentFolders.LastRead` DESC;