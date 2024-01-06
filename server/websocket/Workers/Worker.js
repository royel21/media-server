import fs from "fs-extra";
import path from "path";
import os from "os";

import { findOrCreateFolder } from "./db-worker.js";

import { evaluetePage, adultEvalPage } from "./evaluator.js";

import db from "../Models/index.js";
import { createFolderCover } from "./ImageUtils.js";
import { filterManga, dateDiff, removeRaw, sendMessage, createDir } from "./utils.js";
import { startBrowser, createPage } from "./Crawler.js";

import { downloadLink } from "./link-downloader.js";
import { downloadFromPage } from "./checkServer.js";

const { USE_DEV, BASEPATH, PUPETEER_DIR, PUPETEER_DIR_DEV, IMAGEDIR } = process.env;
const basePath = BASEPATH;
// add stealth plugin and use defaults (all evasion techniques)

const state = { links: [], running: false, size: 0, checkServer: false };

const imgPath = path.join(IMAGEDIR, "images");

createDir(imgPath);

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

const updateLastChapter = async ({ data }, link) => {
  if (data.length) {
    const LastChapter = data[0].name.match(/\d+(-\d+|)( - | |)(raw|END|\[END\]|)/i);

    if (LastChapter && LastChapter[0] !== link.LastChapter) {
      await link.update({ LastChapter: LastChapter[0] });
      sendMessage({ Id: link.Id, ServerId: link.Server.Id }, "update-name");
    }
  }
};

const downloadLinks = async (link, page) => {
  const { Server } = link;
  let isAdult = link.IsAdult;

  try {
    await page.goto(link.Url, { waitUntil: "domcontentloaded" });
    await page.waitForSelector(Server.Chapters, { timeout: 60000 });
    console.log("ch loaded");
  } catch (error) {
    sendMessage({ text: `Could not open URL: ${link.Url}`, color: "red", error });
    return;
  }

  const manga = await page.evaluate(Server.Type.includes("Adult") ? adultEvalPage : evaluetePage, Server.dataValues);
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

  const exclude = await db.Exclude.findAll({ where: { LinkName: folder.Name } });
  for (let d of data) {
    if (state.stopped) break;
    try {
      ++count;
      if (!exclude.find((ex) => d.name.includes(ex.Name))) {
        await downloadLink(d, page, Server, folder, `${count}/${data.length}`, link.IsAdult, state);
      }
    } catch (error) {
      sendMessage({ text: `chapter ${Name} - ${d.name} navigation error`, error });
    }
  }

  let FileCount = fs.readdirSync(mangaDir).filter((f) => f.includes(".zip")).length;

  if (FileCount != folder.FileCount) {
    const Genres = folder.Genres;

    if (folder.IsAdult && !Genres.includes("Adult")) {
      let gens = Genres.split(", ");
      gens.push("Adult");
      gens.sort();
      Genres = gens.join(", ");
    }
    await folder.update({ FileCount, CreatedAt: new Date(), Genres });
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
        await downloadLinks(link, page, link.Server, link.IsAdult);

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

process.on("message", async ({ action, datas, headless, remove, bypass, server }) => {
  console.log("server", action, state.checkServer);
  if (!state.browser) {
    state.browser = await startBrowser({ headless: headless ? "new" : false, userDataDir });
  }

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
        console.log("start-server");
        downloadFromPage(server, state).then(cleanUp).catch(cleanUp);
      }
      break;
    }
    case "Add-Download": {
      state.stopped = false;
      await loadLinks(datas, headless);

      if (!state.running) {
        state.running = true;

        onDownload(bypass, headless, cleanUp)
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
