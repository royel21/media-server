import fs from "fs-extra";

import { findOrCreateFolder, getDb } from "./db-worker.js";

import { evaluetePage, adultEvalPage } from "./evaluator.js";

import { createFolderCover } from "./ImageUtils.js";
import { filterManga, dateDiff, removeRaw, sendMessage, createDir } from "./utils.js";
import { startBrowser, createPage, getPages, delay } from "./Crawler.js";

import { downloadLink } from "./link-downloader.js";
import { downloadFromPage } from "./checkServer.js";
import { downloadNHentai } from "./nhentai.js";

// add stealth plugin and use defaults (all evasion techniques)
const state = { links: [], running: false, size: 0, checkServer: false };

const db = getDb();

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

  if (Server.isMobile) {
    await page.setViewport({ width: 480, height: 840, deviceScaleFactor: 1 });
  }

  try {
    await page.goto(link.Url, { waitUntil: "domcontentloaded" });
    await page.waitForSelector(Server.Chapters, { timeout: 60000 });
  } catch (error) {
    sendMessage({ text: `Could not open URL: ${link.Url}`, color: "red", error });
    return;
  }

  const manga = await page.evaluate(Server.Type.includes("Adult") ? adultEvalPage : evaluetePage, {
    ...Server.dataValues,
    link,
  });
  await validateName(manga, link);

  const { Name } = manga;

  manga.Server = link.Url;

  let folder = await findOrCreateFolder(manga, isAdult);
  createDir(folder.Path);

  const exclude = await db.Exclude.findAll({ where: { LinkName: folder.Name } });

  manga.data = manga.data.filter(removeRaw(manga.data)).filter((f) => !exclude.find((ex) => f.name.includes(ex.Name)));

  await updateLastChapter(manga, link);
  manga.type = "mangas";

  let { files } = await createFolderCover(folder.Path, manga, page);

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
    if (link.Raw && !/ raw$/i.test(d.name)) {
      d.name = d.name + " raw";
    }
    if (state.stopped) break;
    try {
      ++count;
      await downloadLink(d, page, Server, folder, `${count}/${data.length}`, state);
    } catch (error) {
      sendMessage({ text: `chapter ${Name} - ${d.name} navigation error`, error });
    }
  }

  let FileCount = fs.readdirSync(folder.Path).filter((f) => f.includes(".zip")).length;

  if (FileCount != folder.FileCount) {
    folder.FileCount = FileCount;
    folder.CreatedAt = new Date();
  }
  if (folder.IsAdult && !folder.Genres.includes("Adult")) {
    let gens = folder.Genres.split(", ");
    gens.push("Adult");
    folder.Genres = gens.sort().join(", ");
  }
  await folder.save();

  await db.Link.update({ Date: new Date() }, { where: { Name: folder.Name } });
};

const stopDownloads = async () => {
  if (state.current) {
    await state.current.update({ IsDownloading: false });
  }

  for (const link of state.links) {
    await link.update({ IsDownloading: false });
    console.log("stopping", link.Name);
  }
};

const cleanUp = async (error) => {
  if (error) {
    sendMessage({ text: "Process Stopped - Internal Error", color: "red", error });
  }
  const pcount = await getPages();
  if (pcount === 1 || state.stopped) {
    await stopDownloads();
    state.links = [];
    state.running = false;
    state.size = 0;
    state.stopped = false;
    state.browser = null;
    state.checkServer = false;
    if (state.browser) {
      await state.browser.close();
    }
    console.log("pages", pcount);
    sendMessage({ text: "Finish - All Job" }, "stop-process");
    process.exit();
  }
};

const onDownload = async (bypass, headless) => {
  if (!state.browser) {
    state.browser = await startBrowser({ headless: false, userDataDir: "./user-data/puppeteer" });
  }

  const page = await createPage(state.browser);

  while (state.links.length) {
    if (state.stopped) break;
    const link = state.links.shift();
    await link.reload();

    state.current = link;

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
        if (link.Url.includes("nhentai")) {
          await downloadNHentai(link, page, link.Server, state);
        } else {
          await downloadLinks(link, page, link.Server, link.IsAdult);
          await link.update({ IsDownloading: false });
          await link.reload();
        }

        sendMessage({ link }, "update-download");
      } catch (error) {
        sendMessage({ text: `Error ${link.Url} was no properly downloaded`, color: "red", error });
      }
    } else {
      sendMessage({ text: `Link ${link.Name} was checked recently`, color: "red" });
    }
  }

  await page.close();
};

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
        await found.update({ IsDownloading: true });
        state.links.push(found);
        count++;
      }
    }
    state.size += count;
  }
};

const onCreateCover = async ({ Id, imgUrl }) => {
  const page = await createPage(state.browser, 60000);
  if (/http/i.test(imgUrl)) {
    const folder = await db.folder.findOne({ where: { Id } });
    if (folder) {
      const { result } = await createFolderCover(
        folder.Path,
        { poster: imgUrl, Name: folder.Name, type: folder.FilesType },
        page,
        true
      );
      sendMessage({ Id, valid: result }, "create-cover");
    }
  }
  await page.close();
  await cleanUp();
};

let wait = false;

process.on("message", async ({ action, datas, headless, remove, bypass, server }) => {
  console.log("server", action, state.checkServer);
  if (wait) {
    await delay(500);
  }

  if (!state.browser) {
    wait = true;
    try {
      state.browser = await startBrowser({ headless: false, userDataDir: "./user-data/puppeteer" });
    } catch (error) {
      sendMessage({ text: "Error trying to start scraper", error: error.toString() }, "error");
    }
    wait = false;
  }

  switch (action) {
    case "Exit": {
      stopDownloads();
      state.stopped = true;
      await cleanUp();
      break;
    }
    case "Remove": {
      const toRemove = state.links.filter((ld) => remove.includes(ld.Id));
      for (const link of toRemove) {
        await link.update({ IsDownloading: false });
      }
      state.links = state.links.filter((ld) => !remove.includes(ld.Id));
      break;
    }
    case "Check-Server": {
      if (!state.checkServer) {
        state.checkServer = true;
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
        onDownload(bypass, headless).catch(cleanUp).then(cleanUp);
      }
      break;
    }

    case "Create-Cover": {
      onCreateCover(datas);
    }
  }
});

process.on("uncaughtException", async (error, source) => {
  if (!/Missing frame|Parent frame|Target closed|Session closed/gi.test(error.toString())) {
    sendMessage({ text: "uncaughtException Process Stopped - Internal Error", color: "red", error });
  }
});
