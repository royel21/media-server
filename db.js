import db from "./server/models/index.js";
import fs from "fs-extra";

const updateDb = async () => {
  await db.init();
  let i = 0;
  const update = async (items) => {
    for (let d of items) {
      console.log(d.Name);
      await db.folder.update(d, { where: { Name: d.Name, FilesType: "mangas" } });
      i++;
    }
  };
  // await update(fs.readJsonSync("F:\\db1.json"));
  await update(fs.readJsonSync("F:\\db2.json"));
  console.log("updates", i);
};

updateDb();
