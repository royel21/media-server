import fs from "fs-extra";
import path from "path";
import zipper from "zip-local";
import os from "os";

import { findOrCreateFolder, createFile, destroy, findFolder } from "./db-worker.js";

import { evaluetePage, evaleLinks, adultEvalPage } from "./evaluator.js";

import db from "../Models/index.js";
import { downloadAllIMages, createThumb, createFolderCover } from "./ImageUtils.js";
import { filterManga, dateDiff, findRaw, removeRaw, sendMessage } from "./utils.js";
import { startBrowser, createPage } from "./Crawler.js";

const { USE_DEV, BASEPATH, PUPETEER_DIR, PUPETEER_DIR_DEV, IMAGEDIR } = process.env;
const basePath = BASEPATH;
// add stealth plugin and use defaults (all evasion techniques)

const state = { links: [], running: false, size: 0, checkServer: false };

const imgPath = path.join(IMAGEDIR, "images");
if (!fs.existsSync(imgPath)) fs.mkdirsSync(imgPath);

const delay = (ms) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

const validateName = async (manga, link) => {
  let tname = await db.NameList.findOne({ where: { Name: manga.Name } });
  let name = manga.Name;
  //Check if have to use rename manga
  if (tname) {
    manga.Name = tname.AltName;
  }
  const { Name } = manga;
  // update the link name
  if (link.Name !== Name) await link.update({ Name });

  //add names to Alternative Names
  if (link.AltName.length === 0) {
    link.AltName = name + "; " + manga.AltName;
  } else {
    if (!link.AltName.includes(name)) {
      link.AltName += "; " + name;
    }
    if (!link.AltName.includes(manga.AltName)) {
      link.AltName += "; " + manga.AltName;
    }
  }

  await db.Link.update({ AltName: link.AltName }, { where: { Name } });
};

const updateLastChapter = async ({ data, Name }, link) => {
  if (data.length) {
    const LastChapter = data[0].name.match(/\d+(-\d+|)( - | |)(raw|END|\[END\]|)/i);

    if (LastChapter && LastChapter[0] !== link.LastChapter) {
      await link.update({ LastChapter: LastChapter[0] });
      sendMessage({ Id: link.Id, ServerId: link.Server.Id }, "update-name");
    }
  }
};

const downloadLink = async (d, page, Server, folder, mangaDir, count) => {
  const isAdult = Server.Type === "Adult";

  if (!fs.existsSync(mangaDir)) {
    fs.mkdirsSync(mangaDir);
  }

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

  fs.mkdirsSync(dir);

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

    if (!fs.existsSync(imgDir)) fs.mkdirsSync(imgDir);

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

const downloadLinks = async (link, page) => {
  const exclude = await db.Exclude.findAll({ where: { LinkName: link.Name } });
  const { Server } = link;
  const isAdult = Server.Type === "Adult";

  try {
    await page.goto(link.Url, { waitUntil: "domcontentloaded" });
    await page.waitForSelector(Server.Chapters, { timeout: 60000 });
    console.log("ch loaded");
  } catch (error) {
    sendMessage({ text: `Could not open URL: ${link.Url}`, color: "red", error });
    return;
  }

  const manga = await page.evaluate(isAdult ? adultEvalPage : evaluetePage, Server.dataValues);
  await validateName(manga, link);

  const { Name } = manga;

  manga.data = manga.data.filter(removeRaw(manga.data));

  await updateLastChapter(manga, link);

  const Path = `/mnt/5TBHDD/${isAdult ? "R18/webtoon" : "mangas"}`;
  manga.Server = Server.Name;

  let folder = await findOrCreateFolder(Path, manga, isAdult);

  const mangaDir = path.join(basePath, isAdult ? path.join("R18", "webtoon") : "mangas", folder.Name);
  let files = await createFolderCover(mangaDir, manga, imgPath, page);

  if (!folder) {
    return sendMessage({ text: "Fail to find or create folder entry in database", color: "red" });
  }

  sendMessage({ text: `Files: ${files.length} - ${manga.data.length}` });

  if (files.length) {
    manga.data = manga.data.filter(filterManga(files));
  }

  let { data } = manga;
  data.sort((a, b) => a.name.localeCompare(b.name));

  let count = 0;

  for (let d of data) {
    if (state.stopped) break;
    try {
      ++count;
      if (!exclude.find((ex) => d.name.includes(ex.Name))) {
        await downloadLink(d, page, Server, folder, mangaDir, `${count}/${data.length}`);
      }
    } catch (error) {
      sendMessage({ text: `chapter ${Name} - ${d.name} navigation error`, error });
    }
  }

  let FileCount = fs.readdirSync(mangaDir).filter((f) => f.includes(".zip")).length;

  if (FileCount != folder.FileCount) {
    await folder.update({ FileCount, CreatedAt: new Date() });
  }

  await db.Link.update({ Date: new Date() }, { where: { Name: folder.Name } });
};

const cleanUp = async () => {
  state.links = [];
  state.running = false;
  state.size = 0;
  state.stopped = false;
  state.browser = null;
  await state.browser?.close();
  sendMessage({ text: "Finish - All Job" }, "stop-process");
  process.exit();
};

const onDownload = async (bypass, headless) => {
  if (!state.browser) {
    state.browser = await startBrowser({ headless: headless ? "new" : false, userDataDir });
  }

  const page = await createPage(state.browser);

  while (state.links.length) {
    if (state.stopped) break;
    const link = state.links.shift();
    await link.reload();

    //Exclude link from download
    if (link.Exclude) {
      sendMessage({ text: `Link ${link.AltName} Is Exclude From Download`, color: "red" });
      continue;
    }

    if (bypass || !link.Date || dateDiff(new Date(), link.Date) > 3) {
      sendMessage({
        text: `\u001b[1;31m ${state.size - state.links.length}/${state.size} - ${link.Name || link.Url} \u001b[0m`,
        url: link.Url,
      });
      try {
        await downloadLinks(link, page, link.Server);

        await link.reload();
        sendMessage({ link }, "update-download");
      } catch (error) {
        sendMessage({ text: `Error ${link.Url} was no properly downloaded`, color: "red", error });
      }
    } else {
      sendMessage({ text: `Link ${link.Name} was checked recently`, color: "red" });
    }
  }
};

let userDataDir = path.resolve(PUPETEER_DIR || path.join(os.homedir(), ".rc-studio/downloader-pupeteer-data"));

if (USE_DEV) {
  userDataDir = path.resolve(PUPETEER_DIR_DEV);
}

const loadLinks = async (datas) => {
  for (const ServerId in datas) {
    const founds = await db.Link.findAll({
      where: { Id: datas[ServerId] },
      ServerId,
      include: ["Server"],
    });

    let count = 0;
    for (const found of founds) {
      if (!state.links.find((l) => l.Url === found.Url)) {
        state.links.push(found);
        count++;
      }
    }
    state.size += count;
  }
};
//[...document.querySelectorAll("#loop-content .item-summary .post-title")].forEach(e=>console.log(e.textContent))
const checkServer = async (Id, headless) => {
  const server = await db.Server.findOne({ where: { Id: Id } });
  if (server && server?.HomeQuery) {
    try {
      if (!state.browser) {
        state.browser = await startBrowser({ headless: headless ? "new" : false, userDataDir });
      }

      if (!state.browser) {
        process.exit();
      }

      const isAdult = server.Type === "Adult";

      sendMessage({ text: `checking server ${server.Name}` });

      const page = await createPage(state.browser);

      await page.goto(`https:\\${server.Name}`, { waitUntil: "domcontentloaded" });

      await page.waitForSelector(server.HomeQuery);

      const data = await page.evaluate(async (query) => {
        const delay = (ms) => {
          return new Promise((resolve) => {
            setTimeout(resolve, ms);
          });
        };
        document.querySelector(".load-title")?.click();
        await delay(1000);

        return [...document.querySelectorAll(query)].map((e) => {
          const Name = e
            .querySelector(".post-title")
            .textContent.replace("( Renta black and white comic Version)", "")
            .replace(/:|\?|\*|<|>|"| Webtoon| \(Acera\)\n|\n|\t|“|^,/gi, "")
            .replace(/(\.)+$/, "")
            .replace(/”( |)/g, ", ")
            .replace(/^(18\+|(ENDED|END)(\.|)+|ONGOING|ON GOING|HOT|NEW)/, "")
            .replace(/’/g, "'")
            .replace(/( )+/g, " ")
            .trim();

          const chaps = [...e.querySelectorAll(".chapter a")]
            .map((a) => {
              const url = a.href;
              let name = a.textContent
                .replace(Name, "")
                .trim()
                .replace(/( )+/g, " ")
                .replace(/^ |vol.\d+ |(chapter|chap|ch|Capítulo|Episodio)( | - |-)|\||\/|:|\?|\^|"|\*|<|>|\t|\n/gi, "")
                .replace(/(\.)+$/, "");

              if (location.href.includes("mangagreat") && /\d+-/.test(name)) {
                name = name.replace("-", " ");
              }
              name = name.replace(/\./gi, "-");

              let n = name.match(/\d+/);
              if (n) {
                n = n[0];
                const padding = n > 999 ? 4 : 3;
                name = name.replace(n, n.padStart(padding, "0"));

                if (/ raw$/i.test(Name)) {
                  name = name + " raw";
                }
              } else {
                return { name: "" };
              }

              return { name, url };
            })
            .reverse();

          return { Name, chaps };
        });
      }, server.HomeQuery);

      let count = 0;
      const linksId = [];
      const linkData = [];

      // fs.writeJSONSync(`recents/${server.Name}.json`, data);

      for (let { Name, chaps } of data) {
        let tname = await db.NameList.findOne({ where: { Name } });

        const link = await db.Link.findOne({
          where: { Name: tname?.AltName || Name, ServerId: Id },
          include: ["Server"],
        });
        if (link && !state.links.find((l) => l.Url === link.Url)) {
          linksId.push(link.Id);
          linkData.push({ link, chaps });
          count++;
        }
      }
      state.size += count;
      console.log(`loading links ${count}\n`);

      if (count) {
        count = 1;
        for (const d of linkData.reverse()) {
          const folder = await findFolder(d.link.Name);
          if (folder) {
            sendMessage({
              text: `\u001b[1;31m ${count++}/${linkData.length} ${folder.Name} \u001b[0m`,
              url: d.link.Url,
              color: "red",
            });

            let ccount = 1;

            const mangaDir = path.join(basePath, isAdult ? path.join("R18", "webtoon") : "mangas", folder.Name);
            d.chaps = d.chaps.filter(removeRaw(d.chaps));
            const excludes = await db.Exclude.findAll({ where: { LinkName: d.link.Name } });

            let updateFolder = false;

            for (let chap of d.chaps) {
              if (chap.name && !excludes.find((ex) => ex.Name === chap.name)) {
                try {
                  if (await downloadLink(chap, page, server, folder, mangaDir, `${ccount++}/${d.chaps.length}`)) {
                    updateFolder = true;
                  }
                } catch (error) {
                  sendMessage({ text: `chapter ${d.link.Name} - ${d.name} navigation error`, error });
                }
              }
            }

            if (updateFolder) {
              d.chaps.reverse();
              await d.link.update({ LastChapter: d.chaps[0].name });

              let FileCount = fs.readdirSync(mangaDir).filter((f) => f.includes(".zip")).length;
              await folder.update({ FileCount, CreatedAt: new Date() });

              await d.link.reload();
              sendMessage({ link }, "update-download");
            }

            await db.Link.update({ Date: new Date() }, { where: { Name: folder.Name } });
          }
        }

        await page.close();
      }
    } catch (error) {
      sendMessage({ text: `Error checking server ${server?.Name}`, color: "red", error });
    }
    state.checkServer = false;
    await cleanUp();
  }
};

process.on("message", async ({ action, datas, headless, remove, bypass, server }) => {
  switch (action) {
    case "Exit": {
      state.stopped = true;
      await cleanUp();
      break;
    }
    case "Remove": {
      state.links = state.links.filter((ld) => !remove.includes(ld.Id));
      break;
    }
    case "Check-Server": {
      if (!state.checkServer) {
        checkServer(server, headless, bypass);
      }
      break;
    }
    case "Add-Download": {
      state.stopped = false;
      await loadLinks(datas, headless);

      if (!state.running) {
        state.running = true;

        onDownload(bypass, headless)
          .catch((error) => {
            sendMessage({ text: "Process Stopped - Internal Error", color: "red", error });
            cleanUp();
          })
          .then(async () => await cleanUp());
      }
      break;
    }
  }
});

process.on("uncaughtException", async (error, source) => {
  if (!/Missing frame|Parent frame|Target closed|Session closed/gi.test(error.toString())) {
    sendMessage({ text: "uncaughtException Process Stopped - Internal Error", color: "red", error });
  }
});
