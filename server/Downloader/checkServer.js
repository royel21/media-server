import fs from "fs-extra";
import { findFolder, getDb } from "./db-worker.js";

import { delay, filterManga, removeRaw, sendMessage } from "./utils.js";
import { createPage } from "./Crawler.js";
import { downloadLink } from "./link-downloader.js";
import { getProgress } from "../utils.js";

const evalServer = async (query) => {
  return [...document.querySelectorAll(query.HomeQuery)].map((e) => {
    const manga = e.querySelector(".post-title a, .post-title, .bigor-manga h3");
    const Url = manga.querySelector(".post-title a, .thumb-manga > a")?.href.replace(/\/$/, "");

    const Name = manga.textContent
      .replace("( Renta black and white comic Version)", "")
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

    let Unc = /Uncensored/i.test(Name);
    if (Unc) {
      for (let d of chaps) {
        d.name = d.name + " unc";
      }
    }

    return { Name: Name.replace(/ raw$/i, ""), Raw: / raw$/i.test(Name), Url, chaps };
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

export const downloadFromPage = async (Id, state) => {
  const page = await createPage(state.browser);

  const db = getDb();

  const Server = await db.Server.findOne({ where: { Id: Id } });

  if (Server && Server?.HomeQuery && page) {
    try {
      sendMessage({ text: `** ${formatAMPM(new Date())} ${Server.Name} **`, important: true });
      let url = `https:\\${Server.Name}`;

      if (/mangahentai|manytoon|hentaiwebtoon/.test(Server.Name)) {
        url = `${url}\\home`;
      }
      page.goto(url, { waitUntil: "domcontentloaded" });

      await page.waitForSelector(Server.HomeQuery, { timeout: 60000 });

      if (/"mangaread/i.test(Server.Name)) {
        try {
          await page.click("#navigation-ajax");
          await delay(6000);
        } catch (error) {}
      }

      const data = await page.evaluate(evalServer, Server.dataValues);

      const linkData = [];

      for (let { Name, chaps, Url, Raw } of data) {
        Name = Name.replace(" Raw");
        let tname = await db.NameList.findOne({ where: { Name } });
        console.log(Url, tname?.AltName || Name || "", Raw, Server.Id);

        const query = {
          where: { [db.Op.or]: { Url: Url || "", Name: tname?.AltName || Name || "" }, Raw, ServerId: Server.Id },
          include: ["Server"],
        };

        const link = await db.Link.findOne(query);

        if (link) {
          await link.update({ IsDownloading: true });
          linkData.push({ link, chaps });
        }
      }
      sendMessage({ links: linkData.map((d) => d.link) }, "link-update");

      if (linkData.length) {
        let count = 1;
        for (const d of linkData.reverse()) {
          if (state.stopped) break;

          const folder = await findFolder(d.link.Name);
          if (folder) {
            sendMessage({
              text: `\u001b[1;31m ${getProgress(count++, linkData.length)} ${folder.Name} \u001b[0m`,
              url: d.link.Url,
              color: "red",
            });

            if (!fs.existsSync(folder.Path)) {
              fs.mkdirpSync(folder.Path);
            }

            const files = fs.readdirSync(folder.Path);

            d.chaps = d.chaps.filter(removeRaw(d.chaps)).filter(filterManga(files));
            const excludes = await db.Exclude.findAll({ where: { LinkName: d.link.Name } });

            let updateFolder = false;

            let chaptCount = 1;
            for (let chap of d.chaps) {
              if (state.stopped) break;
              const count = `${getProgress(chaptCount++, d.chaps.length)}`;
              if (chap.name && checkIfRaw(chap, folder) && !excludes.find((ex) => chap.name.includes(ex.Name))) {
                try {
                  if (await downloadLink({ d: chap, page, Server, folder, count, state })) {
                    updateFolder = true;
                  }
                } catch (error) {
                  if (!state.stopped) {
                    sendMessage({ text: `chapter ${d.link.Name} - ${d.name} navigation error`, error });
                  }
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

            sendMessage({ link: { ...d.link.dataValues, remove: true } }, "link-update");
            await db.Link.update({ Date: new Date() }, { where: { Name: folder.Name } });
          }
          await d.link.update({ IsDownloading: false });
        }
      }
    } catch (error) {
      if (!state.stopped) {
        console.log(error);
        sendMessage({ text: `Error checking server ${Server?.Name}: Can't access page`, color: "red" });
      }
    }
    if (!state.stopped) {
      sendMessage({ text: `Server finish ${Server?.Name}` });
    }
  }

  state.checkServer = false;
  await page?.close();
};
