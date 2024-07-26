import { createFile, getDb } from "./db-worker.js";
import path from "node:path";
import { sendMessage } from "./utils.js";
import { createThumb, getImgNh } from "./ImageUtils.js";
import defaultConfig from "../default-config.js";
import zipper from "zip-local";
import fs from "fs-extra";

const isChar = (c) => {
  return c.match(/[a-z]/i);
};

const capitalize = (val) => {
  let words = val.split(" ");
  for (let i = 0; i < words.length; i++) {
    let word = words[i].toLowerCase();

    if (i === 0 && words[i].length > 1 && !isChar(words[i][0])) {
      words[i] = words[i].substring(0, 2).toUpperCase() + word.slice(2);
    } else {
      words[i] = word.charAt(0).toUpperCase() + word.slice(1);
    }
  }
  return words.join(" ");
};

const nameFormat = (name) => {
  name = capitalize(name);
  name = name.replace(/vol. /gi, "Vol.");
  if (/Comic /gi.test(name)) {
    let num = name.match(/\d+/);
    if (num) {
      name = name.replace(num, num.toString().padStart(3, "0"));
    }
  }
  return name;
};

const BASEPATH = defaultConfig.DownloadDir;

const dirs = {
  yaoi: path.join(BASEPATH, "R18", "Manga-Hentai", "Yaoi"),
  anthology: path.join(BASEPATH, "R18", "Manga-Hentai", "Anthology"),
  nHentai: path.join(BASEPATH, "R18", "Manga-Hentai", "Tankoubon"),
};

const createThumbFile = async (filePath, file, folder) => {
  const fromImg = path.join(filePath, "001.jpg");
  const cover = path.join(defaultConfig.ImagesDir, "Manga", folder.Name, file + ".jpg");

  await createThumb(fromImg, cover);
};

export const downloadNHentai = async (link, page, server) => {
  const db = getDb();
  try {
    await page.goto(link.Url, { waitUntil: "domcontentloaded" });
    await page.waitForSelector(server.Title);
  } catch (error) {
    console.log(error);
  }

  let data = await page.evaluate((server) => {
    try {
      let url = document.querySelector(".gallerythumb").href;

      let name =
        document.querySelector(".title .before").textContent + document.querySelector(server.Title)?.textContent;
      if (name.includes(" | ")) {
        let parts = name.split(" | ");
        name = parts[0];
        if (parts.length > 1) {
          let n = parts[1].match(/\d+/);
          if (n && !name.includes(n[0])) {
            name = name + " " + n[0];
          }
        }
      }

      let showMore = document.querySelector("#show-all-images-button");
      const tagsDatas = document.querySelectorAll(".tags .tag > span:first-child");

      let tags = "";
      for (let tag of tagsDatas) {
        tags += tag?.textContent || "";
      }

      let type = "nHentai";

      if (tags?.includes("anthology")) type = "anthology";
      if (tags?.includes("yaoi")) type = "yaoi";

      if (showMore) showMore.click();
      let total = 0;
      if (server.Name.includes("nhentai.net")) {
        let tags = document.querySelectorAll(".tags .tag");
        total = +tags[tags.length - 1].textContent;
      } else if (server.Name.includes("nhentai.com")) {
        total = +document.querySelector(server.Imgs).textContent.match(/\d+/)[0];
      }
      name = name
        .replace(/:|\?|\*|<|>|#|  "/gi, "")
        .replace(/( )+/, " ")
        .replace(/"|\.$/gi, "");
      return { name, url, total, type, tags };
    } catch (error) {
      return { name: "", error: error.toString() };
    }
  }, server.dataValues);

  console.log("name: ", data.name, "total-pages: ", data.total, data.error);
  sendMessage({ text: `pages: ${data.total} - Name: ${data.name}` });

  if (!data.name) return;

  const curDir = dirs[data.type];

  const folder = await db.folder.findOne({
    where: { Path: { [db.Op.like]: `%Manga-Hentai/${curDir.split(path.sep).pop()}%` } },
  });

  data.name = nameFormat(data.name);

  data.name = capitalize(data.name.trim());
  let filePath = path.join(curDir, data.name.split("|")[0]);

  const Name = { [db.Op.like]: `%${data.name.replace(" [Digital]", "")}%` };
  let found = (await db.file.findOne({ where: { Name } })) || fs.existsSync(filePath + ".zip");

  if (!found) {
    await page.goto(data.url, { waitUntil: "domcontentloaded" });
    let initalUrl = await page.evaluate(() => {
      return document.querySelector("#image-container img")?.src;
    });

    if (initalUrl) {
      fs.mkdirs(filePath);

      let ex = initalUrl.split(".").pop();
      let format = ["png", "gif", "jpg"];
      let f = 0;
      let newEX = ex;
      let count = 0;
      for (let i = 1; i < data.total + 1; ) {
        try {
          let imagePath = `${filePath}/${i.toString().padStart("3", "0")}.${newEX}`;
          process.stdout.write(`\t IMG: ${i} / ${data.total}\r`);
          if (!fs.existsSync(imagePath)) {
            await getImgNh(imagePath, initalUrl.replace(`/1.${ex}`, `/${i}.${newEX}`), page);
          }

          if (!fs.existsSync(imagePath)) {
            if (format[f]) {
              i--;
              newEX = format[f];
              f++;
            }
          } else {
            f = 0;
          }
        } catch (err) {
          console.log("initalUrl: ", initalUrl.replace(`/1.${ex}`, `/${i}.${newEX}`), err);
          count++;
          if (count > 10) break;
        }

        i++;
      }

      let files = fs.readdirSync(filePath);

      if (files.length === data.total) {
        await createThumbFile(filePath, data.name + ".zip", folder);
        zipper.sync
          .zip(filePath)
          .compress()
          .save(filePath + ".zip");
        fs.removeSync(filePath);
        found = true;

        await createFile(filePath + ".zip", folder.Id, files.length);
      }
    }
  }

  if (found) {
    await link.destroy();
    process.send({ event: "link-update", data: { Id: link.Id, ServerId: server.Id } });
  }
};
