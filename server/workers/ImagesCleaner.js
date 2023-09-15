import fs from "fs-extra";
import path from "path";
import { config } from "dotenv";

config();
import db from "../models/index.js";

const sendMessage = (text, event = "info") => {
  process.send({ event, text });
};

const cleanImages = async () => {
  const imagesDir = process.env.IMAGES;
  let count = 0;
  for (let dir of fs.readdirSync(imagesDir)) {
    sendMessage(`Cleaning ${imagesDir}/${dir}`);
    if (/R18/.test(dir)) continue;

    if (/Folder/.test(dir)) {
      const folders = fs.readdirSync(path.join(imagesDir, dir));
      for (let folder of folders) {
        try {
          const files = fs.readdirSync(path.join(imagesDir, folder, dir));
          for (let img of files) {
            const found = await db.folder.findOne({ where: { Name: img.replace(".jpg", "") } });
            if (!found) {
              fs.removeSync(path.join(imagesDir, folder, dir, img));
            }
          }
        } catch (error) {
          console.log(error);
        }
      }
    } else {
      const folders = fs.readdirSync(path.join(imagesDir, dir));
      for (let folder of folders) {
        try {
          const fpath = path.join(imagesDir, dir, folder);
          const found = await db.folder.findOne({ where: { Name: folder } });
          if (!found) {
            fs.removeSync(fpath);
            count++;
          } else {
            const files = fs.readdirSync(fpath);
            const founds = await found.getFiles();
            const filtered = files.filter((f) => !founds.find((fd) => f.includes(fd.Name)));
            for (let file of filtered) {
              fs.removeSync(path.join(fpath, file));
            }
          }
        } catch (error) {
          console.log(error);
        }
      }
    }
  }
  process.exit();
};

process.on("message", cleanImages);
