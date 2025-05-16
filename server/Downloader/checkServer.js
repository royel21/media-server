import fs from "fs-extra";
import { findFolder, getDb } from "./db-worker.js";

import { filterManga, removeRaw, sendMessage } from "./utils.js";
import { createPage } from "./Crawler.js";
import { downloadLink } from "./link-downloader.js";

const evalServer = async (query) => {
  const delay = (ms) => {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  };
  document.querySelector(".load-title")?.click();
  await delay(1000);

  return [...document.querySelectorAll(query.HomeQuery)].map((e) => {
    const Name = e
      .querySelector(".post-title, .bigor-manga h3")
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

        if (/^Tales Of Demons/i.test(Name)) {
          name = name.replace("-6", "-5");
          name = name.replace("-1", "");
        }

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
      .filter((a) => {
        if (!/^000(-| |(-| )Prologue|$)/gi.test(a.name)) {
          if (/ raw/i.test(a.name)) {
            return query.Raw;
          }
          return true;
        }
        return false;
      })
      .reverse();

    return { Name: Name.replace(/ raw$/i, ""), chaps };
  });
};

const checkIfRaw = (file, folder) => {
  if (file.name.includes("raw")) {
    return folder.Path.includes("Webtoons Raw");
  }

  return true;
};

const formatAMPM = (date) => {
  let hours = date.getHours();
  let minutes = date.getMinutes();
  let ampm = hours >= 12 ? "pm" : "am";
  hours = hours % 12;
  hours = hours ? hours : 12;
  minutes = minutes.toString().padStart(2, "0");
  let strTime = `${date.toDateString()}, ${hours}:${minutes} ${ampm}`;
  return strTime;
};

export let stopCheckServer = {};

export const downloadFromPage = async (Id, state) => {
  const page = await createPage(state.browser);

  const db = getDb();

  const server = await db.Server.findOne({ where: { Id: Id } });
  if (server && server?.HomeQuery && page) {
    try {
      sendMessage({ text: `** ${formatAMPM(new Date())} ${server.Name} **`, important: true });

      const abortController = new AbortController();

      stopCheckServer.signal = abortController;

      await page.goto(`https:\\${server.Name}`, { waitUntil: "domcontentloaded" });
      await page.waitForSelector(server.HomeQuery, abortController);

      if (state.stopped) {
        state.checkServer = false;
        return await page?.close();
      }

      const data = await page.evaluate(evalServer, server.dataValues);

      const linkData = [];

      for (let { Name, chaps } of data) {
        let tname = await db.NameList.findOne({ where: { Name: Name.replace(" Raw") } });

        const query = {
          where: { Name: tname?.AltName || Name, ServerId: Id },
          include: ["Server"],
        };

        if (/raw/i.test(Name)) query.where.url = { [db.Op.like]: `%-raw%` };

        const link = await db.Link.findOne(query);

        if (link) {
          await link.update({ IsDownloading: true });
          linkData.push({ link, chaps });
        }
      }

      if (linkData.length) {
        let count = 1;
        for (const d of linkData.reverse()) {
          if (state.stopped) break;

          const folder = await findFolder(d.link.Name);
          if (folder) {
            sendMessage({
              text: `\u001b[1;31m ${count++}/${linkData.length} ${folder.Name} \u001b[0m`,
              url: d.link.Url,
              color: "red",
            });
            const files = fs.readdirSync(folder.Path);

            d.chaps = d.chaps.filter(removeRaw(d.chaps)).filter(filterManga(files));
            const excludes = await db.Exclude.findAll({ where: { LinkName: d.link.Name } });

            let updateFolder = false;

            let chaptCount = 1;
            for (let chap of d.chaps) {
              if (state.stopped) break;

              if (chap.name && checkIfRaw(chap, folder) && !excludes.find((ex) => chap.name.includes(ex.Name))) {
                try {
                  if (
                    await downloadLink(
                      chap,
                      page,
                      server,
                      folder,
                      `${chaptCount++}/${d.chaps.length}`,
                      d.link.IsAdult,
                      state
                    )
                  ) {
                    updateFolder = true;
                  }
                } catch (error) {
                  sendMessage({ text: `chapter ${d.link.Name} - ${d.name} navigation error`, error });
                }
              }
            }

            d.chaps.reverse();
            if (d.chaps.length && d.chaps[0].name !== d.link.LastChapter) {
              await d.link.update({ LastChapter: d.chaps[0].name });
            }

            if (updateFolder) {
              let FileCount = fs.readdirSync(folder.Path).filter((f) => f.includes(".zip")).length;
              await folder.update({ FileCount, CreatedAt: new Date() });

              await d.link.reload();
            }

            sendMessage({ link: d.link.dataValues }, "update-download");
            await db.Link.update({ Date: new Date() }, { where: { Name: folder.Name } });
          }
          await d.link.update({ IsDownloading: false });
        }
      }
    } catch (error) {
      console.log("server-error: ", error);
      sendMessage({ text: `Error checking server ${server?.Name}: Can't access page`, color: "red" });
    }
    sendMessage({ text: `Server finish ${server?.Name}` });
  }

  state.checkServer = false;
  await page?.close();
};
