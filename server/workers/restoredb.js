import fs from "fs-extra";
import db from "../models/index.js";

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
    const folders = await db.folder.findAll({ where: { Path: rec.map((f) => f.Folder) } });

    rec = rec.map((r) => {
      r.FolderId = folders.find((f) => f.Path === r.Folder).Id;
      delete r.Folder;
      return { ...r, UserId };
    });
    const files = await db.file.findAll({
      where: { [db.Op.or]: rec.map((r) => ({ Name: r.Name, FolderId: r.FolderId })) },
    });

    rec = rec.map((r) => {
      r.FileId = files.find((f) => f.Name === r.Name).Id;
      delete r.Name;
      return r;
    });

    await db.recentFile.bulkCreate(rec, { updateOnDuplicate: ["LastPos"] });
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

    await db.recentFolder.bulkCreate(recent, { updateOnDuplicate: ["CurrentFile", "LastRead"] });
  } catch (error) {
    console.log(error);
  }
};

const createDirStruct = async (dir) => {
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
    await db.folder.bulkCreate(
      dir.Folders.map((f) => {
        f.DirectoryId = directory.Id;
        return f;
      }),
      {
        include: { model: db.file, updateOnDuplicate: ["Name", "FolderId", "Duration"] },
        updateOnDuplicate: ["AltName", "Genres", "Description", "IsAdult", "Server"],
      }
    );
  } catch (error) {
    console.log(dir.Name, "Folders Duplicate Error");
  }
};

export const restoreDb = async (backupFile) => {
  console.time("restore");
  await db.init(true);
  const savePath = `${BACKUPDIR}/${backupFile}`;
  if (!fs.existsSync(savePath)) {
    sendMessage(`Backup: ${savePath} no found`);
    process.exit();
  }

  sendMessage(`Restoring: ${backupFile}`);
  const datas = fs.readJSONSync(savePath);
  for (const dir of datas.directory) {
    sendMessage(`Creating ${dir.Name}`);
    await createDirStruct(dir);
  }

  sendMessage(`Creating Users`);
  for (const user of datas.users) {
    const nuser = await createUserAndFav(user);
    if (nuser) {
      await createRecentFiles(user.RecentFiles, nuser.Id);
      await createRecentFolders(user.RecentFolders, nuser.Id);
    }
  }
  console.timeEnd("restore");
  process.exit();
};
