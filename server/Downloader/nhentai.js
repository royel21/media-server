import { createFile, getDb } from "./db-worker.js";
import path from "node:path";
import { createDir, sendMessage } from "./utils.js";
import { getImgNh, saveThumbnail } from "./ImageUtils.js";
import defaultConfig from "../default-config.js";
import fs from "fs-extra";
import AdmZip from "adm-zip";
import { createPage } from "./Crawler.js";

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

const formats = ["jpg", "png", "gif"];

const download = async (link, page, server, state) => {
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

      name = name.replace(/\//g, "-").trim();

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
        .replace(/\\|\//, "-")
        .replace(/"|\.$/gi, "");
      return { name, url, total, type, tags };
    } catch (error) {
      return { name: "", error: error.toString() };
    }
  }, server.dataValues);

  sendMessage({ text: `pages: ${data.total} - Name: ${data.name}` });

  if (!data.name) return;

  const curDir = dirs[data.type] || dirs.nHentai;
  console.log("current-dir:", curDir);

  const folder = await db.folder.findOne({
    where: { Path: { [db.Op.like]: `%${curDir}%` } },
  });

  data.name = nameFormat(data.name);
  let filePath = path.join(curDir, data.name);

  const Name = { [db.Op.like]: `%${data.name.replace(" [Digital]", "").replace(/\[.*.\] /, "")}%` };
  console.log("name: ", data.name, "total-pages: ", data.total, Name);
  let found = (await db.file.findOne({ where: { Name } })) && fs.existsSync(filePath + ".zip");

  if (!found) {
    await page.goto(data.url, { waitUntil: "domcontentloaded" });
    let initalUrl = await page.evaluate(() => {
      return document.querySelector("#image-container img")?.src;
    });

    if (initalUrl) {
      let ex = initalUrl.split(".").pop();
      let f = 0;
      let newEX = ex;
      let count = 0;

      var zip = new AdmZip();

      const imageBasePath = path.join(defaultConfig.ImagesDir, "Manga", folder.Name);
      createDir(imageBasePath);

      const cover = path.join(imageBasePath, data.name + ".zip.jpg");
      for (let i = 1; i < data.total + 1; ) {
        if (state.stopped) return;
        const padded = i.toString().padStart("3", "0");
        const newImg = `${padded}.${newEX}`;
        process.stdout.write(`\t\t\t\th: IMG: ${padded} / ${data.total}\r`);
        const url = initalUrl.replace(`/1.${ex}`, `/${i}.${newEX}`);

        if (f > 2) {
          sendMessage({ text: `FormatError: ${f} unkown`, color: "red" });
          break;
        }

        try {
          const img = await getImgNh(url, page);

          if (img.badImage) {
            newEX = formats[f++];
          } else {
            const buff = await img.toFormat("jpg").toBuffer();
            zip.addFile(newImg, buff);
            count++;
            if (i === 1 && !fs.existsSync(cover)) {
              await saveThumbnail(buff, cover);
            }
            f = 0;
            i++;
          }
        } catch (error) {
          console.log(error);
          newEX = formats[f];
          f++;
        }
      }

      if (count >= data.total - 1 && data.name) {
        zip.writeZip(filePath + ".zip");
        await createFile(filePath + ".zip", folder.Id, count);
        await link.destroy();
        sendMessage({ text: `Save: ${data.name}\n` });
        await folder.update({ FileCount: folder.FileCount + 1 });
      } else {
        await link.update({ Name, IsDowloanding: false });
      }
    }
  } else {
    await link.destroy();
    process.send({ event: "link-update", data: { Id: link.Id, ServerId: server.Id } });
    sendMessage({ text: `Exist: ${data.name}\n` });
  }
};

export const downloadNHentais = async (state) => {
  let page;
  try {
    page = await createPage(state.browser);
  } catch (error) {
    console.log(error);
    return;
  }

  while (state.nhentais.length) {
    if (state.stopped) break;
    const link = state.nhentais.shift();
    try {
      await link.reload();
    } catch (error) {
      console.log(error);
      continue;
    }

    const count = state.hsize - state.nhentais.length;
    sendMessage({
      text: `\u001b[1;31m ${count}/${state.hsize} - ${link.Name || link.Url} \u001b[0m`,
      url: link.Url,
    });
    try {
      await download(link, page, link.Server, state);
    } catch (error) {
      sendMessage({ text: `Error ${link.Url} was no properly downloaded`, color: "red", error });
    }

    sendMessage({ link: link, remove: true }, "link-update");
  }
  state.hrunning = false;
  state.hsize = 0;
  await page.close();
};
