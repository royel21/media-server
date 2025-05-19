import StreamZip from "node-stream-zip";
import db from "../models/index.js";
import { Op } from "sequelize";

const loadZipImages = async (data, socket, user) => {
  let { Id, indices } = data;
  console.log(indices);
  let file = await db.file.findOne({
    attributes: ["Id", "Name"],
    where: { Id },
    include: { model: db.folder, where: { IsAdult: { [Op.lte]: user.AdultPass } }, required: true },
  });

  if (file && file.Exists) {
    try {
      const zip = new StreamZip.async({
        file: file.Path,
        storeEntries: true,
      });

      const entries = Object.values(await zip.entries())
        .sort((a, b) => String(a.name).localeCompare(String(b.name)))
        .filter((entry) => !entry.isDirectory);
      for (let i of indices) {
        if (entries[i]) {
          const img = await zip.entryData(entries[i]);
          socket.emit("image-loaded", {
            page: i,
            img: img.toString("base64"),
            id: file.Id,
          });
          console.log("img-zip:", i);
        }
      }
      await zip?.close();

      socket.emit("image-loaded", { last: true, id: file.Id });
    } catch (error) {
      socket.emit("image-loaded", { error: "some error" });
      console.log(error);
    }
  } else {
    socket.emit("manga-error", { error: `File ${file.Name} Not Found in server`, Id: file.Id });
  }
};

export default {
  loadZipImages,
};
