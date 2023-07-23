import db from "../models/index.js";
import { literal } from "sequelize";
import fs from "fs-extra";

const { BACKUPDIR, DB } = process.env;

const sendMessage = (text, event = "info") => {
  if (process.send) {
    process?.send({ event, text });
  } else {
    console.log(text);
  }
};

//*****************Backup Helpers***********************************/
const mapData = (rf) => {
  delete rf.dataValues.Id;
  return rf.dataValues;
};

const getRecentFolders = async (UserId) => {
  const result = await db.recentFolder.findAll({
    attributes: [
      "LastRead",
      "CurrentFile",
      [
        literal(`(Select Name from Files where Id = RecentFolders.CurrentFile AND FolderId=RecentFolders.FolderId)`),
        "File",
      ],
      [literal(`(Select Path from Folders where Id = RecentFolders.FolderId)`), "Path"],
    ],
    where: { UserId },
  });
  return result.map(mapData);
};

const getRecentFiles = async (UserId) => {
  return db.recentFile.findAll({
    where: { UserId },
    attributes: [
      "LastPos",
      [literal("(SELECT Name From Files Where Id=RecentFiles.FileId)"), "Name"],
      [
        literal("(SELECT PATH FROM Folders where Id = (SELECT FolderId FROM Files WHERE Id=RecentFiles.FileId))"),
        "Folder",
      ],
    ],
  });
};

const mapDirectory = (dir) => {
  sendMessage(`Mapping ${dir.FullPath}`);
  delete dir.dataValues.Id;
  dir.IsLoading = false;

  dir.dataValues.Folders = dir.dataValues.Folders.map((folder) => {
    delete folder.dataValues.Id;
    delete folder.dataValues.DirectoryId;

    folder.dataValues.Files = folder.dataValues.Files.map((d) => {
      delete d.dataValues.Id;
      delete d.dataValues.FolderId;
      return d.dataValues;
    });

    return folder.dataValues;
  });

  return dir.dataValues;
};

const getAllDirectories = async () => {
  const result = await db.directory.findAll({
    include: {
      model: db.folder,
      order: ["Name"],
      include: {
        model: db.file,
      },
    },
  });
  return result.map(mapDirectory);
};

export const backupDb = async () => {
  sendMessage(`Bakup ---${DB}---`);
  console.time("Backup");
  if (BACKUPDIR) {
    try {
      const users = await db.user.findAll({
        include: [{ model: db.favorite, include: { model: db.folder, attributes: ["Path"] } }],
      });
      const datas = { users: [], directory: [] };

      for (const u of users) {
        sendMessage(`**********User: ${u.Name}**************`);
        const RecentFolders = await getRecentFolders(u.Id);
        sendMessage("RecentFolders: " + RecentFolders.length);
        const RecentFiles = await getRecentFiles(u.Id);
        sendMessage("RecentFiles: " + RecentFiles.length);

        const Favorites = [];

        for (let fav of u.Favorites) {
          Favorites.push({ Name: fav.Name, Folders: fav.Folders.map((f) => f.Path) });
        }
        sendMessage("Favorites: " + Favorites.length);

        delete u.dataValues.Id;
        delete u.dataValues.Recent;
        delete u.dataValues.Favorites;
        const user = { ...u.dataValues, RecentFolders, Favorites, RecentFiles };

        datas.users.push(user);
      }

      sendMessage("Getting Files From DB this may take a while");
      datas.directory = await getAllDirectories();

      fs.mkdirsSync(BACKUPDIR);
      const savePath = `${BACKUPDIR}/${DB} - ${new Date()
        .toLocaleString()
        .replace(/\//g, "-")
        .replace(/:/g, "'")}.json`;
      fs.writeJSONSync(savePath, datas);
      sendMessage("Save to " + savePath);
    } catch (error) {
      console.log(error.toString());
    }
  }
  console.timeEnd("Backup");
  process.exit();
};
