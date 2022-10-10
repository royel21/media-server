import db from "./server/models/index.js";
import fs from "fs-extra";

const updateDb = async () => {
  await db.init();
  let i = 0;
  const folders = await db.folder.findAll({ order: ["Name"] });
  const update = async (items) => {
    for (let d of items) {
      const found = folders.find((f) => f.Name === d.Name);
      if (found) {
        console.log(found.Name);
        await found.update(d);
        i++;
      }
    }
  };
  await update(fs.readJsonSync("F:\\db1.json"));
  await update(fs.readJsonSync("F:\\db2.json"));
  console.log("updates", i);
};

updateDb();
