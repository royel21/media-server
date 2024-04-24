import fs from "fs-extra";
import path from "path";
import { config } from "dotenv";

config();
import db from "../models/index.js";

const sendMessage = (text, event = "info") => {
  process.send({ event, text });
};

const { IMAGES_DIR } = process.env;

const types = {
  Manga: "mangas",
  Video: "videos",
};

const cleanImages = async () => {
  let count = 0;
  //Cleaning Folder Thumbnails
  sendMessage(`Cleaning Folder Thumbnails`);
  for (let dir of ["mangas", "videos"]) {
    const imgDir = path.join(IMAGES_DIR, "Folder", dir);
    const imgs = fs.readdirSync(imgDir);
    for (let img of imgs) {
      if ((await db.folder.findOne({ where: { Name: img.replace(".jpg", "") } })) === null) {
        fs.removeSync(path.join(imgDir, img));
      }
    }
  }

  for (const Type of ["Manga", "Video"]) {
    const imgDir = path.join(IMAGES_DIR, Type);
    const folders = fs.readdirSync(imgDir);
    for (const folder of folders) {
      const found = await db.folder.findOne({
        where: { Name: folder, FilesType: types[Type] },
        include: { model: db.file, attributes: ["Name"] },
      });

      if (found?.Files) {
        const imgPath = path.join(imgDir, folder);
        const imgs = fs.readdirSync(path.join(imgDir, folder));

        for (const img of imgs) {
          const name = img.replace(".jpg", "");
          if (!found.Files.find((f) => f.Name === name)) {
            fs.removeSync(path.join(imgPath, img));
          }
        }
      }
    }
  }
  process.exit();
};

process.on("message", cleanImages);
