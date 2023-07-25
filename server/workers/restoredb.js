import fs from "fs-extra";
import db from "../models/index.js";

const getTime = () => new Date().getTime();
const getTimeDif = (t) => `${(new Date().getTime() - t) / 1000.0}s`;

const { BACKUPDIR } = process.env;

const sendMessage = (text, event = "info") => {
  if (process.send) {
    process?.send({ event, text });
  } else {
    console.log(text);
  }
};

const createUserAndFav = async (user) => {
  let found = await db.user.findOne({ where: { Name: user.Name } });
  if (found) {
    await found.update(user);
  } else {
    found = await db.user.create(user, { include: { model: db.favorite } });
  }
  //   Create Favorites
  for (let fav of user.Favorites) {
    try {
      const [nfav] = await db.favorite.findOrCreate({ where: { Name: fav.Name, UserId: found.Id } });
      if (nfav) {
        let folders = await db.folder.findAll({ where: { Path: fav.Folders } });
        await nfav.addFolders(folders);
      }
    } catch (error) {
      console.log(error.toString());
    }
  }
  return found;
};

const createRecentFiles = async (rec, UserId) => {
  if (rec.length) {
    try {
      const folders = await db.folder.findAll({ where: { Path: rec.map((f) => f.Folder) } });

      const files = [];
      for (let folder of folders) {
        const Name = rec.filter((r) => r.Folder === folder.Path).map((r) => r.Name);

        const founds = await db.file.findAll({
          where: { Name, FolderId: folder.Id },
        });

        founds.forEach((f) => {
          const r = rec.find((r) => r.Name === f.Name && r.Folder === folder.Path);
          delete r.Folder;
          delete r.Name;
          files.push({
            ...r,
            FileId: f.Id,
            UserId,
          });
        });
      }

      await db.recentFile.bulkCreate(files, { updateOnDuplicate: ["LastPos"] });
    } catch (error) {
      console.log(error);
    }
  }
};

const createRecentFolders = async (list, UserId) => {
  try {
    const items = list.map((rf) => rf.Path);
    let founds = await db.folder.findAll({ where: { Path: items } });
    const files = await db.file.findAll({ where: { Name: list.filter((f) => f.File).map((f) => f.File) } });
    const recent = list.map((rf) => {
      rf.FolderId = founds.find((f) => f.Path === rf.Path)?.Id;
      rf.CurrentFile = files.find((f) => f.Name === rf.File)?.Id;
      delete rf.Folder;
      delete rf.File;
      return { ...rf, UserId };
    });

    await db.recentFolder.bulkCreate(recent, { updateOnDuplicate: ["CurrentFile", "LastRead", "FolderId", "UserId"] });
  } catch (error) {
    console.log(error);
  }
};

const createDirStruct = async (dir) => {
  sendMessage(`Creating ${dir.Name}`);
  const [directory] = await db.directory.findOrCreate({
    where: {
      Name: dir.Name,
      FullPath: dir.FullPath,
      Type: dir.Type,
      IsAdult: dir.IsAdult,
      FirstInList: dir.FirstInList,
    },
  });
  try {
    const folDatas = dir.Folders.map((f) => {
      f.DirectoryId = directory.Id;
      return f;
    });
    let folders = await db.folder.bulkCreate(folDatas, {
      updateOnDuplicate: ["AltName", "Genres", "Description", "IsAdult", "Server"],
    });

    folders = await db.folder.findAll({ where: { Path: folDatas.map((fd) => fd.Path) } });

    let files = [];
    for (const folder of dir.Folders) {
      const FolderId = folders.find((fol) => fol.Path === folder.Path).Id;
      folder.Files.forEach((f) => {
        files.push({
          ...f,
          FolderId,
          Path: folder.Path,
        });
      });
    }

    sendMessage("files: " + files.length);
    await db.file.bulkCreate(files, { updateOnDuplicate: ["Name", "Duration", "Size", "Type"] });
  } catch (error) {}
};

export const restoreDb = async (backupFile) => {
  const time = getTime();
  await db.init();
  const savePath = `${BACKUPDIR}/${backupFile}`;
  if (!fs.existsSync(savePath)) {
    sendMessage(`Backup: ${savePath} no found`);
    process.exit();
  }

  sendMessage(`Restoring: ${backupFile}`);
  const datas = fs.readJSONSync(savePath);
  for (const dir of datas.directory) {
    const start = getTime();
    await createDirStruct(dir);
    sendMessage(`${dir.Name}: ${getTimeDif(start)}`);
  }

  sendMessage(`Creating Users`);
  for (const user of datas.users) {
    const nuser = await createUserAndFav(user);
    if (nuser) {
      await createRecentFiles(user.RecentFiles, nuser.Id);
      await createRecentFolders(user.RecentFolders, nuser.Id);
    }
  }
  sendMessage("Restore: " + getTimeDif(time));
  process.exit();
};
