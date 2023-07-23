import fs from "fs-extra";
import path from "path";
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

const mapData = (rf) => {
  delete rf.dataValues.Id;
  return rf.dataValues;
};

const backup = async () => {
  console.time("Backup");
  const users = await db.user.findAll({
    include: [{ model: db.favorite, include: { model: db.folder, attributes: ["Path"] } }],
  });
  const datas = { users: [], directory: [] };
  for (const u of users) {
    const RecentFolders = (
      await db.recentFolder.findAll({
        attributes: [
          "LastRead",
          [
            literal(
              `(Select Name from Files where Id = RecentFolders.CurrentFile AND FolderId=RecentFolders.FolderId)`
            ),
            "File",
          ],
          [(literal(`(Select Path from Folders where Id = RecentFolders.FolderId)`), "Path")],
        ],
        where: { UserId: u.Id },
      })
    ).map(mapData);

    // const RecentFiles = (
    //   await db.recentFile.findAll({
    //     attributes: ["LastPos", [literal(`(Select Name from Files where Id = RecentFiles.FileId)`), "Name"]],
    //     where: { UserId: u.Id },
    //   })
    // ).map(mapData);

    const Favorites = [];

    for (let fav of u.Favorites) {
      Favorites.push({ Name: fav.Name, Folder: fav.Folders.map((f) => f.Path) });
    }

    delete u.dataValues.Id;
    delete u.dataValues.Recent;
    delete u.dataValues.Favorites;
    const user = { ...u.dataValues, RecentFolders, Favorites };

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
  // await db.init(true);
  console.time("restore");
  const datas = fs.readJSONSync("./backup/db.json");
  for (const dir of datas.directory) {
    try {
      const directory = await db.directory.create(dir);
      await db.folder.bulkCreate(
        dir.Folders.map((f) => {
          f.DirectoryId = directory.Id;
          return f;
        }),
        { include: { model: db.file } }
      );
    } catch (error) {
      console.log(dir.Name, error);
    }
  }
  for (const user of datas.users) {
    let found = await db.user.findOne({ where: { Name: user.Name } });
    if (found) {
      await found.update(user);
    } else {
      found = await db.user.create(user, { include: { model: db.favorite } });
    }
    //Create Favorites
    for (let fav of user.Favorites) {
      try {
        const [nfav] = await db.favorite.findOrCreate({ where: { Name: fav.Name, UserId: found.Id } });
        if (nfav) {
          let folders = await db.folder.findAll({ where: { Path: fav.Path } });
          await nfav.addFolders(folders);
        }
      } catch (error) {}
    }

    const list = user.RecentFolders;
    try {
      const items = list.map((rf) => rf.Path);
      let founds = await db.folder.findAll({ where: { Path: items } });
      const files = await db.file.findAll({ where: { Name: list.map((f) => f.File) } });
      const recent = list.map((rf) => {
        rf.FolderId = founds.find((f) => f.Path === rf.Path).Id;
        rf.CurrentFile = files.find((f) => f.Name === rf.File).Id;
        delete rf.Folder;
        delete rf.File;
        return { ...rf, UserId: found.Id };
      });
      await db.recentFolder.bulkCreate(recent);
    } catch (error) {
      console.log(error);
    }
  }
  console.timeEnd("restore");
  process.exit();
};

const test = async () => {
  const imagesDir = process.env.IMAGES;
  let count = 0;
  for (let dr of fs.readdirSync(imagesDir)) {
    if (/Folder/.test(dr)) {
      const files = fs.readdirSync(path.join(imagesDir, dr));
      for (let img of files) {
        const found = await db.folder.findOne({ where: { Name: img.replace(".jpg", "") } });
        if (!found) {
          fs.removeSync(path.join(imagesDir, dr, img));
          console.log(img);
        }
      }
    }
    if (/Folder|R18/.test(dr)) continue;

    const folders = fs.readdirSync(path.join(imagesDir, dr));
    for (let folder of folders) {
      const fpath = path.join(imagesDir, dr, folder);
      const found = await db.folder.findOne({ where: { Name: folder } });
      if (!found) {
        console.log(folder);
        fs.removeSync(fpath);
        count++;
      } else {
        const files = fs.readdirSync(fpath);
        const founds = found.getFiles();
        const filtered = files.filter((f) => !founds.find((fd) => f.includes(fd.Name)));
        for (let file of filtered) {
          console.log(path.join(fpath, file));
        }
      }
    }
  }
  console.log("Count", count);
  // const all = await db.folder.findAll({
  //   include: {
  //     model: db.folder,
  //     order: ["Name"],
  //     include: {
  //       model: db.file,
  //     },
  //   },
  // });
  // all.forEach((d) => console.log(d.Folders.length));
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
