import db from "../models/index.js";
import { literal } from "sequelize";
import fs from "fs-extra";
import defaultConfig from "../default-config.js";

export const dayfmt = new Intl.DateTimeFormat("en-GB", {
  year: "2-digit",
  month: "short",
  day: "2-digit",
  hour: "2-digit",
  minute: "numeric",
  second: "2-digit",
  hour12: true,
});

function formatAMPM() {
  const date = dayfmt.format(new Date());
  let parts = date.split(", ");
  let time = parts[1].split(" ");

  return `${parts[0].replace(" ", "-")} ${time[1].toUpperCase()} ${time[0]}`.replace(/:/g, "'");
}

const sendMessage = (text, event = "info") => {
  if (process.send) {
    process?.send({ event, text });
  } else {
    console.log(text);
  }
};

//*****************Backup Helpers***********************************/
const removeId = (rf) => {
  delete rf.dataValues.Id;
  return rf.dataValues;
};

const getRecentFolders = async (UserId, db) => {
  const result = await db.recentFolder.findAll({
    attributes: [
      "LastRead",
      [
        literal(`(Select Name from Files where Id = RecentFolders.CurrentFile AND FolderId=RecentFolders.FolderId)`),
        "File",
      ],
      [literal(`(Select Name from Folders where Id = RecentFolders.FolderId)`), "Folder"],
      [literal(`(Select FilesType from Folders where Id = RecentFolders.FolderId)`), "Type"],
    ],
    where: { UserId },
  });

  const datas = [];
  for (let file of result) {
    const { File, Folder, Type, LastRead } = file.dataValues;
    if (File) {
      datas.push({
        File,
        LastRead,
        Folder: { Folder, Type },
      });
    }
  }

  return datas;
};

const getRecentFiles = async (UserId, db) => {
  const result = await db.recentFile.findAll({
    where: { UserId },
    attributes: [
      "LastPos",
      [literal("(SELECT Name From Files Where Id=RecentFiles.FileId)"), "Name"],
      [
        literal(
          "(SELECT Folders.Name FROM Folders where Id = (SELECT FolderId FROM Files WHERE Id=RecentFiles.FileId))"
        ),
        "Folder",
      ],
      [
        literal(
          "(SELECT Folders.FilesType FROM Folders where Id = (SELECT FolderId FROM Files WHERE Id=RecentFiles.FileId))"
        ),
        "Type",
      ],
    ],
  });
  const datas = {};
  for (let file of result) {
    const { Name, Folder, Type, LastPos } = file.dataValues;
    if (LastPos) {
      if (!datas[Folder]) {
        datas[Folder] = { Type, files: [] };
      }
      datas[Folder].files.push({ Name, LastPos });
    }
  }

  return datas;
};

const mapDirectory = (dir) => {
  delete dir.dataValues.Id;
  dir.IsLoading = false;

  const folders = [];
  sendMessage(`Mapping ${dir.FullPath} - folders: ${dir.dataValues.Folders.length}`);

  dir.dataValues.Folders.forEach((folder) => {
    delete folder.dataValues.Id;
    delete folder.dataValues.DirectoryId;

    folder.dataValues.Files = folder.dataValues.Files.map((d) => {
      delete d.dataValues.Id;
      delete d.dataValues.FolderId;
      return d.dataValues;
    });

    if (!folders.find((f) => f.Path.toLowerCase() === folder.Path.toLowerCase())) {
      folders.push(folder.dataValues);
    } else {
      sendMessage(`Removing duplicate: ${folder.Path}`);
    }
  });

  dir.dataValues.Folders = [...folders];
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

export const getUserData = async (users, db) => {
  const usersData = [];

  for (const u of users) {
    try {
      sendMessage(`**********User: ${u.Name}**************`);
      const RecentFolders = await getRecentFolders(u.Id, db);
      sendMessage("RecentFolders: " + RecentFolders.length);
      const RecentFiles = await getRecentFiles(u.Id, db);
      sendMessage("RecentFiles: " + Object.keys(RecentFolders).length);

      const Favorites = [];

      for (let fav of u.Favorites) {
        Favorites.push({ Name: fav.Name, Folders: fav.Folders.map((f) => f.Path) });
      }
      sendMessage("Favorites: " + Favorites.length);

      delete u.dataValues.Id;
      delete u.dataValues.Recent;
      delete u.dataValues.Favorites;
      const user = { ...u.dataValues, RecentFolders, Favorites, RecentFiles };

      usersData.push(user);
    } catch (error) {
      console.log(error);
    }
  }

  return usersData;
};

export default async () => {
  sendMessage(`Bakup ---${defaultConfig.dbName}---`);
  console.time("Backup");
  if (defaultConfig.BackupDir) {
    try {
      const datas = { users: [], directory: [] };

      const users = await db.user.findAll({
        include: [
          { model: db.favorite, required: false, include: { model: db.folder, attributes: ["Path"], required: false } },
        ],
      });

      datas.users = await getUserData(users, db);

      sendMessage("Getting Files From DB_NAME this may take a while");
      datas.directory = await getAllDirectories();

      fs.mkdirsSync(defaultConfig.BackupDir);
      const savePath = `${defaultConfig.BackupDir}/${defaultConfig.dbName} - ${formatAMPM(new Date()).replace(
        /:/g,
        "'"
      )}.json`;
      fs.writeJSONSync(savePath, datas);
      sendMessage("Save to " + savePath);
    } catch (error) {
      console.log(error.toString());
    }
  }
  console.timeEnd("Backup");
  process.exit();
};
