import fs from "fs-extra";
import path from "path";
import zipper from "zip-local";

import { createFile, destroy } from "./db-worker.js";

import { evaleLinks } from "./evaluator.js";

import { downloadAllIMages } from "./ImageUtils.js";
import { findRaw, sendMessage, createDir } from "./utils.js";
import defaultConfig from "../default-config.js";

createDir(defaultConfig.ImagesDir);

export const downloadLink = async (d, page, Server, folder, count, state) => {
  const mangaDir = folder.Path;
  const imgDir = path.join(defaultConfig.ImagesDir, "Manga", folder.Name);

  createDir(imgDir);
  createDir(mangaDir);

  const exists = fs.readdirSync(mangaDir).find(findRaw(d.name));

  if (!/ raw/i.test(d.name) && exists) {
    fs.removeSync(path.join(mangaDir, exists));
    const cover = path.join(imgDir, exists + ".jpg");
    if (fs.existsSync(cover)) {
      fs.removeSync(cover);
    }
    await destroy({ where: { Name: exists, FolderId: folder.Id } });
  }

  let dir = path.join(mangaDir, d.name);
  if (fs.existsSync(dir + ".zip") || fs.existsSync(dir.replace(" raw", "") + ".zip")) {
    return;
  }

  let links = [];

  let query = {};
  if (!Server.LocalImages) {
    query.waitUntil = "domcontentloaded";
  }

  if (/mangas.ins/gi.test(d.url)) {
    await page.goto(d.url + "?style=list", query);
  } else {
    await page.goto(d.url, query);
  }

  if (Server.Name.includes("manganatos")) {
    await page.select(".loadImgType", "1");
  }

  if ((await page.$(".listing-chapters_wrap li a")) && Server.Name.includes("mangaread")) {
    return;
  }

  await page.waitForSelector(Server.Imgs);

  links = await page.evaluate(evaleLinks, Server.dataValues);
  sendMessage({ text: `Dwn: ${count} imgs: ${links.length} - ${folder.Name} - ${d.name}`, url: d.url });

  const destZip = dir + ".zip";
  const imgPath = path.join(imgDir, d.name + ".zip.jpg");
  const result = await downloadAllIMages(page, links, state, imgPath, folder.Name + "/" + d.name, destZip);

  if (result.valid && !state.stopped) {
    await createFile(destZip, folder.Id, result.count);
    return true;
  } else {
    sendMessage({ text: `Some Images Pendding for: ${d.name}`, color: "red", url: d.url });
  }
};
