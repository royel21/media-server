import fs from "fs-extra";
import path from "path";

import { createFile, destroy } from "./db-worker.js";

import { evaleLinks } from "./evaluator.js";

import { downloadAllIMages } from "./ImageUtils.js";
import { findRaw, sendMessage, createDir } from "./utils.js";
import defaultConfig from "../default-config.js";

createDir(defaultConfig.ImagesDir);

export const downloadLink = async ({ d, page, Server, folder, count, state }) => {
  const mangaDir = folder.Path;
  const imgDir = path.join(defaultConfig.ImagesDir, "Manga", folder.Name);

  createDir(imgDir);
  createDir(mangaDir);

  const exists = fs.readdirSync(mangaDir).find(findRaw(d.name));

  if (!/ raw/i.test(d.name) && exists) {
    await destroy({ where: { Name: exists, FolderId: folder.Id } });
  }

  let dir = path.join(mangaDir, d.name);
  const noCensored = dir.replace(/ unc$/, ".zip");

  if (/ unc$/i.test(d.name) && fs.existsSync(noCensored)) {
    await destroy({ where: { Name: d.name.replace(" unc", ".zip"), FolderId: folder.Id } });
  }

  if (fs.existsSync(dir + ".zip") || fs.existsSync(dir.replace(" raw", "") + ".zip")) {
    return;
  }

  let query = {};
  if (!Server.LocalImages) {
    query.waitUntil = "domcontentloaded";
  }

  if (/mangas.ins/gi.test(d.url)) {
    await page.goto(d.url + "?style=list", query);
  } else {
    await page.goto(d.url, query);
  }

  if (Server.Name.includes("mangaread") && (await page.$(".listing-chapters_wrap li a"))) {
    return;
  }

  await page.waitForSelector(Server.Imgs);

  const links = await page.evaluate(evaleLinks, Server.dataValues);
  sendMessage({ text: `Dwn: ${count} ch:${d.name} ~ img: ${links.length} ~ ${folder.Name}`, url: d.url });

  const destZip = dir + ".zip";
  const imgPath = path.join(imgDir, d.name + ".zip.jpg");
  const result = await downloadAllIMages(page, links, state, imgPath, folder.Name + "/" + d.name, destZip);

  if (result.valid) {
    await createFile(destZip, folder.Id, result.count);
    sendMessage({ text: `Save: ${d.name}` });
    return true;
  } else {
    sendMessage({ text: `Some Images Pendding for: ${d.name}`, color: "red", url: d.url });
  }
};
