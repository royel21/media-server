import db from "../models/index.js";
import { literal } from "sequelize";
import fs from "fs-extra";

const { BACKUPDIR, DB } = process.env;

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
const mapData = (rf) => {
  delete rf.dataValues.Id;
  return rf.dataValues;
};

const getRecentFolders = async (UserId, db) => {
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

const getRecentFiles = async (UserId, db) => {
  const result = await db.recentFile.findAll({
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
  return result.map((r) => r.dataValues);
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

      usersData.push(user);
    } catch (error) {
      console.log(error);
    }
  }

  return usersData;
};

export default async () => {
  sendMessage(`Bakup ---${DB}---`);
  console.time("Backup");
  if (BACKUPDIR) {
    try {
      const datas = { users: [], directory: [] };

      const users = await db.user.findAll({
        include: [
          { model: db.favorite, required: false, include: { model: db.folder, attributes: ["Path"], required: false } },
        ],
      });

      datas.users = await getUserData(users, db);

      sendMessage("Getting Files From DB this may take a while");
      datas.directory = await getAllDirectories();

      fs.mkdirsSync(BACKUPDIR);
      const savePath = `${BACKUPDIR}/${DB} - ${formatAMPM(new Date()).replace(/:/g, "'")}.json`;
      fs.writeJSONSync(savePath, datas);
      sendMessage("Save to " + savePath);
    } catch (error) {
      console.log(error.toString());
    }
  }
  console.timeEnd("Backup");
  process.exit();
};
