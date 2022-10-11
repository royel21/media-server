import fs from "fs-extra";
import db from "./server/models/index.js";
import { compare } from "./src/stringUtils.js";

let i = 0;
const updateDb = async () => {
  await db.init();
  const update = async (items) => {
    for (let d of items) {
      console.log(d.Name);
      await db.folder.update(d, { where: { Name: d.Name } });
      i++;
    }
  };

  await update(fs.readJsonSync(`backup/${process.env.DB}.json`));
  console.log("update", i);
};

const saveDb = async () => {
  let datas = [];
  const folders = await db.folders.findAll();
  for (let folder of folders) {
    if (!datas.find((f) => compare(f, folder))) {
      datas.push({
        Name: folder.Name,
        AltName: folder.AltName,
        Genres: folder.Genres,
        Description: folder.Description,
        Status: folder.Status,
        IsAdult: folder.IsAdult,
      });
    }
    i++;
  }
  fs.writeJSONSync(`backup/${process.env.DB}.json`, data);
  console.log("save", i);
};

const works = {
  updateDb,
  saveDb,
};
const action = process.argv[2];
if (action) {
  console.log(action);
  works[action]();
}
