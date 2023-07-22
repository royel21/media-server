import fs from "fs-extra";
import db from "./server/models/index.js";
import { compare } from "./src/stringUtils.js";
import { literal } from "sequelize";

const capitalize = (val) => {
  let words = val.split(" ");
  for (let i = 0; i < words.length; i++) {
    words[i] = words[i].charAt(0).toUpperCase() + words[i].toLowerCase().slice(1);
  }
  return words.join(" ");
};

let i = 0;
const updateDb = async () => {
  await db.init();
  const update = async (items) => {
    for (let d of items) {
      const found = await db.folder.findOne({ where: { Name: d.Name } });
      if (found && d.Description) {
        if (d.AltName !== "N/A") {
          d.AltName = capitalize(d.AltName.replace("',", ""));
        }
        // console.log(found.Name);
        await found.update(d);
        i++;
      }
    }
  };

  await update(fs.readJsonSync(`backup/${process.env.CDB}.json`));
  console.log("update", i);
};

const saveDb = async () => {
  let datas = [];
  const folders = await db.folder.findAll({
    order: ["Name"],
  });

  for (let folder of folders) {
    if (!datas.find((f) => compare(f, folder))) {
      datas.push({
        Name: folder.Name,
        AltName: folder.AltName,
        Genres: folder.Genres,
        Description: folder.Description,
        Status: folder.Status,
        IsAdult: folder.IsAdult,
        FilesType: folder.FilesType,
        Server: folder.Server,
      });
      i++;
    }
  }

  fs.writeJSONSync(`backup/${process.env.DB}.json`, datas);
  console.log("save", i, `backup/${process.env.DB}.json`);
};

const test = () => {
  const datas = fs.readJsonSync(`backup/mediaserverdb.json`);

  for (const d of datas) {
    const genres = d.Genres.split(",").map((d) => d.trim());
    genres.sort();
    d.Genres = genres.join(", ");
  }
  fs.writeJsonSync(`backup/mediaserverdb.json`, datas);
};

const mapData = (rf) => {
  delete rf.dataValues.Id;
  return rf.dataValues;
};

const backup = async () => {
  console.time("Backup");
  const users = await db.user.findAll({
    include: [{ model: db.recent }, { model: db.favorite, include: { model: db.folder, attributes: ["Path"] } }],
  });
  const datas = { users: [], directory: [] };
  for (const u of users) {
    const RecentFolders = (
      await db.recentFolder.findAll({
        attributes: [
          "CurrentFile",
          "LastRead",
          [literal(`(Select Path from Folders where Id = RecentFolders.FolderId)`), "Folder"],
        ],
        where: { RecentId: u.Recent.Id },
      })
    ).map(mapData);

    const RecentFiles = (
      await db.recentFile.findAll({
        attributes: ["LastPos", [literal(`(Select Name from Files where Id = RecentFiles.FileId)`), "File"]],
        where: { RecentId: u.Recent.Id },
      })
    ).map(mapData);

    const Favorites = [];

    for (let fav of u.Favorites) {
      Favorites.push({ Name: fav.Name, Folder: fav.Folders.map((f) => f.Path) });
    }

    delete u.dataValues.Id;
    delete u.dataValues.Recent;
    delete u.dataValues.Favorites;
    const user = { ...u.dataValues, RecentFiles, RecentFolders, Favorites };

    datas.users.push(user);
  }

  datas.directory = (
    await db.directory.findAll({
      include: {
        model: db.folder,
        order: ["Name"],
        include: {
          model: db.file,
        },
      },
    })
  ).map((dir) => {
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
  });

  fs.writeJSONSync("./backup/db.json", datas);
  console.timeEnd("Backup");
  process.exit();
};

const restore = async () => {
  console.time("restore");
  const datas = fs.readJSONSync("./backup/db.json");

  for (const dir of datas.directory) {
    let found = await db.directory.findOne({ where: { FullPath: dir.FullPath } });
    await found?.destroy();

    try {
      const directory = await db.directory.create(dir);
      for (const folder of dir.Folders) {
        found = await db.directory.findOne({ where: { Path: folder.Path } });
        await found?.destroy();

        folder.DirectoryId = directory.Id;
        await db.folder.create(folder, { include: { model: db.file } });
      }
    } catch (error) {
      console.log(dir.Name, error);
    }
  }

  for (const user of datas.users) {
    let found = await db.user.findOne({ where: { Name: user.Name } });
    if (found.Name === "Administrator") continue;
    await found?.destroy();

    const nuser = await db.user.create(user);
  }
  console.timeEnd("restore");
  process.exit();
};

const works = {
  updateDb,
  saveDb,
  backup,
  restore,
  test,
};

const action = process.argv[2];

if (action) {
  console.log(action);
  works[action]();
}
