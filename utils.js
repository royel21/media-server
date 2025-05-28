import { fixAltName } from "./server/Downloader/utils.js";
import db from "./server/models/index.js";

const fixAltnames = async () => {
  const folders = await db.folder.findAll({ where: { FilesType: "mangas" } });
  let count = 0;
  for (const folder of folders) {
    if (folder.AltName) {
      folder.AltName = fixAltName(folder.AltName);
      await folder.save();
      count++;
      if (folder.AltName.includes(", ")) {
        console.log(folder.Name);
      }
    }
  }

  console.log("fixed: ", count);
};
fixAltnames();
