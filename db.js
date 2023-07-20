import fs from "fs-extra";
import db from "./server/models/index.js";
import { compare } from "./src/stringUtils.js";

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

const works = {
  updateDb,
  saveDb,
  test,
};

const action = process.argv[2];

if (action) {
  console.log(action);
  works[action]();
}
