import StreamZip from "node-stream-zip";
import db from "#server/models/index";
import { Op } from "sequelize";
import fs from "fs-extra";

const loadZipImages = async (data, socket, user) => {
  let { Id, indices, Path, imageCount } = data;
  let file;

  if (!Path && Id) {
    file = await db.file.findOne({
      attributes: ["Id", "Name"],
      where: { Id },
      include: { model: db.folder, where: { IsAdult: { [Op.lte]: user.AdultPass } }, required: true },
    });
  }

  if (fs.existsSync(file?.Path || Path)) {
    try {
      const zip = new StreamZip.async({
        file: file?.Path || Path,
        storeEntries: true,
      });

      const entries = Object.values(await zip.entries())
        .sort((a, b) => String(a.name).localeCompare(String(b.name)))
        .filter((entry) => !entry.isDirectory);

      if (imageCount) {
        const images = entries.filter((f) => /\.(jpg|webp|png|gif)$/i.test(f.name));
        socket.emit("zip-data", { total: images.length });
      }

      for (let i of indices) {
        if (entries[i]) {
          const img = await zip.entryData(entries[i]);
          socket.emit("image-loaded", {
            page: i,
            img: img.toString("base64"),
            id: Id,
          });
        }
      }
      await zip?.close();

      socket.emit("image-loaded", { last: true, id: Id });
    } catch (error) {
      socket.emit("image-loaded", { error: "some error" });
      console.log(error);
    }
  } else {
    socket.emit("manga-error", { error: `File ${file?.Name || Path} Not Found in server`, Id: Id });
  }
};

export default {
  loadZipImages,
};
