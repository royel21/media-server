import fs from "fs-extra";
import db from "../Models/index.js";
import { findFolder } from "./db-worker.js";

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

    return { Name, chaps };
  });
};

export const downloadFromPage = async (Id, state) => {
  const server = await db.Server.findOne({ where: { Id: Id } });
  if (server && server?.HomeQuery) {
    try {
      sendMessage({ text: `*** checking server ${server.Name} ***`, important: true });

      const page = await createPage(state.browser);
      await page.goto(`https:\\${server.Name}`, { waitUntil: "domcontentloaded" });
      await page.waitForSelector(server.HomeQuery);
      const data = await page.evaluate(evalServer, server.dataValues);

      const linkData = [];

      for (let { Name, chaps } of data) {
        let tname = await db.NameList.findOne({ where: { Name } });

        const link = await db.Link.findOne({
          where: { Name: tname?.AltName || Name, ServerId: Id },
          include: ["Server"],
        });

        if (link) {
          linkData.push({ link, chaps });
        }
      }

      if (linkData.length) {
        let count = 1;
        for (const d of linkData.reverse()) {
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
              if (chap.name && !excludes.find((ex) => chap.name.includes(ex.Name))) {
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

            if (updateFolder) {
              d.chaps.reverse();
              await d.link.update({ LastChapter: d.chaps[0].name });

              let FileCount = fs.readdirSync(folder.Path).filter((f) => f.includes(".zip")).length;
              await folder.update({ FileCount, CreatedAt: new Date() });

              await d.link.reload();
              sendMessage({ link: d.link.dataValues }, "update-download");
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
  }
};
