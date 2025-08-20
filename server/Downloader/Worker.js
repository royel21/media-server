import fs from "fs-extra";

import { findOrCreateFolder, getDb } from "./db-worker.js";

import { evaluetePage, adultEvalPage } from "./evaluator.js";

import { createFolderCover } from "./ImageUtils.js";
import { filterManga, dateDiff, removeRaw, sendMessage, createDir } from "./utils.js";
import { startBrowser, createPage, delay } from "./Crawler.js";

import { downloadLink } from "./link-downloader.js";
import { downloadFromPage } from "./checkServer.js";
import { downloadNHentais } from "./nhentai.js";
import { cleanText, getProgress } from "../utils.js";
import { validAltName } from "#server/share/utils";

// add stealth plugin and use defaults (all evasion techniques)
const state = { links: [], running: false, size: 0, checkServer: false, nhentais: [], hrunning: false, hsize: 0 };

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

  await db.Link.update({ AltName: validAltName(link.AltName) }, { where: { Name } });
};

const updateLastChapter = async ({ data }, link) => {
  if (data.length) {
    const LastChapter = data[0].name;

    try {
      if (LastChapter !== link.LastChapter) {
        await link.update({ LastChapter });
        sendMessage({ Id: link.Id, ServerId: link.Server.Id }, "update-name");
      }
    } catch (error) {}
  }
};

const downloadLinks = async (link, page) => {
  const appConfig = await db.AppConfig.findOne();

  const { Server } = link;
  let isAdult = link.IsAdult;

  try {
    await page.goto(link.Url, { waitUntil: "domcontentloaded" });
    await page.waitForSelector(Server.Chapters, { timeout: 60000 });
  } catch (error) {
    if (!state.stopped) {
      await sendMessage({ text: `Could not open URL: ${link.Url}`, color: "red", error });
    }
    return;
  }

  const manga = await page.evaluate(Server.Type.includes("Adult") ? adultEvalPage : evaluetePage, {
    ...Server.dataValues,
    link,
  });

  manga.Name = cleanText(manga.Name, appConfig);

  const { Name } = manga;

  await validateName(manga, link);

  manga.Server = link.Url;

  let folder = await findOrCreateFolder(manga, isAdult, link.Raw);
  createDir(folder.Path);

  const exclude = await db.Exclude.findAll({ where: { LinkName: folder.Name } });

  manga.data = manga.data
    .filter(removeRaw(manga.data))
    .filter((f) => !exclude.find((ex) => f.name.includes(ex.Name)) || /( |\[)end(\]|)$/i.test(f.name));

  await updateLastChapter(manga, link);
  manga.type = "mangas";

  let { files } = await createFolderCover(folder.Path, manga, page);

  if (!folder) {
    return await sendMessage({ text: "Fail to find or create folder entry in database", color: "red" });
  }

  await sendMessage({ text: `Files: ${files.length} - Server: ${manga.data.length}` });

  if (files.length) {
    manga.data = manga.data.filter(filterManga(files));
  }

  let { data } = manga;
  data.sort((a, b) => a.name.localeCompare(b.name));

  await link.reload();
  sendMessage({ link }, "link-update");

  let count = 0;
  for (let d of data) {
    if (state.stopped) {
      break;
    }

    if (link.Raw && !/ raw$/i.test(d.name)) {
      d.name = d.name + " raw";
    }

    try {
      ++count;
      //d, page, Server, folder, count, state
      const progress = `${getProgress(count, data.length)}`;
      await downloadLink({ d, page, Server, folder, state, count: progress });
    } catch (error) {
      await sendMessage({ text: `chapter ${Name} - ${d.name} navigation error`, error });
    }
  }

  sendMessage({ link }, "link-update");

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
  await db.Link.update({ IsDownloading: false }, { where: { IsDownloading: true } });
};

const cleanUp = async (error) => {
  if (state.stopped) {
    const pages = await state.browser?.pages();
    for (let page of pages) {
      try {
        await page.close();
      } catch (error) {}
    }
    state.running = false;
    state.hrunning = false;
    state.checkServer = false;
  } else if (error) {
    await sendMessage({ text: "Process Stopped - Internal Error:" + error.toString(), color: "red", error });
  }

  if ((!state.running && !state.hrunning && !state.checkServer) || state.stopped) {
    if (state.browser) {
      await state.browser.close();
    }
    const info = state.stopped ? { text: "All Job Stopped", color: "red" } : { text: "All Job Finished" };

    await stopDownloads();
    state.links = [];
    state.nhentais = [];
    state.size = 0;
    state.hsize = 0;
    state.stopped = false;
    state.browser = null;
    state.running = false;
    state.hrunning = false;
    state.checkServer = false;
    await sendMessage(info);
    process.exit();
  }
};

const onDownload = async (bypass) => {
  const page = await createPage(state.browser);
  if (page) {
    while (state.links.length) {
      if (state.stopped) break;

      const link = state.links.shift();

      try {
        await link.reload();
      } catch (error) {
        console.log(error);
        continue;
      }

      //Exclude link from download
      if (link.Exclude) {
        await sendMessage({ text: `Link ${link.AltName} Is Exclude From Download`, color: "red" });
        continue;
      }

      if (bypass || !link.Date || dateDiff(new Date(), link.Date) > 3) {
        const count = state.size - state.links.length;
        await sendMessage({
          text: `\u001b[1;31m ${getProgress(count, state.size)} - ${link.Name || link.Url} \u001b[0m`,
          url: link.Url,
        });
        try {
          await downloadLinks(link, page, link.Server, link.IsAdult);
        } catch (error) {
          await sendMessage({ text: `Error ${link.Url} was no properly downloaded`, color: "red", error });
        }

        await link.update({ IsDownloading: false });
        await link.reload();
        sendMessage({ link: { ...d.link.dataValues, remove: true } }, "link-update");
      } else {
        await sendMessage({ text: `Link ${link.Name} was checked recently`, color: "red" });
      }
    }

    await page.close();
  }

  state.running = false;
  state.links = [];
  state.size = 0;
};

const loadLinks = async (Id, bypass) => {
  const temps = [];
  const htemps = [];

  const founds = await db.Link.findAll({
    where: { Id },
    include: ["Server"],
  });

  for (const found of founds) {
    const { Url } = found;

    if (Url.includes("nhentai") && !state.nhentais.find((l) => l.Url === Url)) {
      htemps.push(found);
      state.hsize++;
      await found.update({ IsDownloading: true });
    } else if (!state.links.find((l) => l.Url === Url)) {
      temps.push(found);
      state.size++;
      await found.update({ IsDownloading: true });
    }
    await sendMessage({ link: found, downloading: true }, "link-update");
  }

  state.links = [...state.links, ...temps];
  state.nhentais = [...state.nhentais, ...htemps];

  if (!state.running && temps.length) {
    state.running = true;
    onDownload(bypass).then(cleanUp).catch(cleanUp);
  }

  if (!state.hrunning && htemps.length) {
    state.hrunning = true;
    downloadNHentais(state).then(cleanUp).catch(cleanUp);
  }
};

const onCreateCover = async ({ Id, imgUrl }) => {
  const page = await createPage(state.browser, 60000);
  if (/http/i.test(imgUrl)) {
    const folder = await db.folder.findOne({ where: { Id } });
    console.log(Id, imgUrl, folder?.Name);
    if (folder) {
      createDir(folder.Path);
      const { result } = await createFolderCover(
        folder.Path,
        { poster: imgUrl, Name: folder.Name, type: folder.FilesType },
        page,
        true
      );
      sendMessage({ Id, valid: result }, "cover-update");
    }
  }
  await page.close();

  await cleanUp();
};

const loadFromList = async (DownloadingListId) => {
  const downloads = await db.Downloading.findAll({ where: { DownloadingListId } });
  await loadLinks(downloads.map((lk) => lk.LinkId));
  sendMessage({ text: "downloadings-reload" }, "reload-downloads");
};

const removeDownloading = async (Id) => {
  for (const found of await db.Link.findAll({ where: { Id } })) {
    await found.update({ IsDownloading: false });
  }
  state.links = state.links.filter((ld) => !Id.includes(ld.Id));
  state.nhentais = state.nhentais.filter((ld) => !Id.includes(ld.Id));
};

let loadingBroser = false;

process.on("message", async ({ action, datas, remove, bypass, server }) => {
  if (action === "Exit") {
    state.stopped = true;
  }

  while (loadingBroser) {
    await delay(500);
  }

  loadingBroser = true;

  if (!state.browser && !["Exit", "Remove"].includes(action)) {
    let tryCount = 2;
    let err;
    console.log(tryCount, !state.browser);
    while (tryCount > 0 && !state.browser) {
      try {
        console.log("*************** Server ******************");
        state.browser = await startBrowser({ headless: false });
        sendMessage({ IsRunning: state.browser !== undefined }, "is-running");
        break;
      } catch (error) {
        err = error;
        console.log(err);
      }
      await delay(500);
      tryCount--;
    }
    if (!state.browser) {
      console.log(err);
      return console.log("error trying to start browser");
    }
  }

  loadingBroser = false;

  if (state.stopped) {
    return;
  }

  switch (action) {
    case "Exit": {
      await cleanUp();
      break;
    }
    case "Remove": {
      await removeDownloading(remove);

      if (!state.browser && !state.checkServer) {
        process.exit();
      }
      break;
    }
    case "Check-Server": {
      if (!state.checkServer) {
        state.checkServer = true;
        console.log("start-server");
        downloadFromPage(server, state).then(cleanUp);
      }
      break;
    }
    case "Load-Downloads": {
      await loadFromList(datas.Id);
      break;
    }
    case "Add-Download": {
      await loadLinks(datas, bypass);
      break;
    }
    case "Create-Cover": {
      onCreateCover(datas);
    }

    case "is-running": {
      sendMessage({ IsRunning: state.browser !== undefined }, "is-running");
    }
  }
});

const errorToSkip =
  /frame|Parent frame|main frame|Target closed|Session closed|Page.addScriptToEvaluateOnNewDocument|TargetCloseError|Protocol error|navigation error/gi;

process.on("uncaughtException", async (error) => {
  if (!errorToSkip.test(error.toString()) && !state.stopped) {
    console.log(error.toString());
    await sendMessage({ text: "uncaughtException Process Stopped - Internal Error", color: "red" });
  }
});
