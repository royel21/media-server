import { fixAltName } from "./server/Downloader/utils";
import db from "./server/models/index.js";

const fixAltnames = async () => {
  const folders = await db.folder.findAll({ FilesType: "mangas" });
  let count = 0;
  for (const folder of folders) {
    if (folder.AltName) {
      folder.AltName = fixAltName(folder.AltName);
      await folder.save();
      count++;
    }
  }

  console.log("fixed: ", count);
};

fixAltnames();
