import fs from "fs-extra";
import path from "path";
import zipper from "zip-local";

import { createFile, destroy } from "./db-worker.js";

import { evaleLinks } from "./evaluator.js";

import { downloadAllIMages, createThumb } from "./ImageUtils.js";
import { findRaw, sendMessage, createDir } from "./utils.js";

const { IMAGEDIR } = process.env;
const imgPath = path.join(IMAGEDIR, "images");

export const downloadLink = async (d, page, Server, folder, count, adult, state) => {
  const mangaDir = folder.Path;
  const isAdult = adult || Server.Type === "Adult";

  createDir(mangaDir);

  const exists = fs.readdirSync(mangaDir).find(findRaw(d.name));

  if (!/ raw/i.test(d.name) && exists) {
    fs.removeSync(path.join(mangaDir, exists));
    const cover = path.join(imgPath, "Manga", folder.Name, exists + ".jpg");
    if (fs.existsSync(cover)) {
      fs.removeSync(cover);
    }
    await destroy({ where: { Name: exists, FolderId: folder.Id } });
  }

  let dir = path.join(mangaDir, d.name);
  if (fs.existsSync(dir + ".zip") || fs.existsSync(dir.replace(" raw", "") + ".zip")) {
    return;
  }

  sendMessage({ text: `Dwn: ${count} - ${folder.Name} - ${d.name}`, url: d.url });
  let links = [];

  createDir(dir);

  let query = {};
  if (!Server.LocalImages) {
    query.waitUntil = "domcontentloaded";
  }

  if (/aquamanga|mangagreat|mangaread/gi.test(d.url)) {
    await page.goto(d.url, query);
  } else {
    await page.goto(d.url + "?style=list", query);
  }

  if (Server.Name.includes("manganatos")) {
    await page.select(".loadImgType", "1");
  }

  await page.waitForSelector(Server.Imgs);

  links = await page.evaluate(evaleLinks, Server.dataValues);

  // await delay(60000);
  await downloadAllIMages(page, links, dir, state, Server.LocalImages);

  const images = fs.readdirSync(dir);

  if (images.length === links.length && !state.stopped) {
    const imgDir = path.join(imgPath, "Manga", folder.Name);

    createDir(imgDir);

    const fromImg = path.join(dir, images[0]);

    const toImg = path.join(imgPath, "Manga", folder.Name, d.name + ".zip.jpg");
    await createThumb(fromImg, toImg);

    zipper.sync
      .zip(dir)
      .compress()
      .save(dir + ".zip");

    sendMessage({ text: `The file: ${d.name}.zip was saved!` });
    await createFile(dir + ".zip", folder.Id, images.length, isAdult);

    fs.removeSync(dir);
    return true;
  } else {
    sendMessage({ text: `Some Images Pendding for: ${d.name}`, color: "red", url: d.url });
  }
};
