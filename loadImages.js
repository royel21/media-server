import { createPage, delay, startBrowser } from "#server/Downloader/Crawler";
import path from "node:path";
import { db } from "./server/GameModels/index.js";
import os from "os";
import fs from "fs-extra";
import { downloadImg } from "#server/Downloader/ImageUtils";

const homedir = os.homedir();

const worker = async () => {
  const games = await db.Info.findAll();

  const containAssianChar = /[\u3400-\u9FBF]|[\u1100-\u11FF\u3130-\u318F\uA960-\uA97F\uAC00-\uD7AF\uD7B0-\uD7FF]/g;
  const browser = await startBrowser({ headless: false });

  const page = await createPage(browser);
  for (const game of games) {
    if (game.Info && game.Codes !== undefined && /(r|v)\d+$/.test(game.Codes)) {
      if (game.Info && containAssianChar.test(game.Info.AltName || "")) {
        continue;
      }
      console.log("https://vndb.org/" + game.Codes);
      await page.goto("https://vndb.org/" + game.Codes);
      const data = await page.evaluate(async () => {
        const data = {};
        let list = [...document.querySelectorAll(".vndetails td")];
        let index = 0;
        list.forEach((td, i) => {
          if (td.textContent.includes("Developer")) {
            index = i + 1;
          }
        });
        if (index > 0) {
          data.Company = list[index].textContent.trim();
        }

        data.altName = document.querySelector(".alttitle")?.textContent.trim();

        return data;
      });

      try {
        if (!game.Info.Company) {
          game.Info.Company = data.Company;
        }
        if (!game.Info.AltName.includes(data.AltName)) {
          if (game.Info.AltName) {
            game.Info.AltName = data.AltName + "\n" + game.Info.AltName;
          } else {
            game.Info.AltName = data.AltName;
          }
        }

        if (!game.Info.OS) {
          game.Info.OS = "Windows";
        }

        if (!game.Info.Lang) {
          game.Info.Lang = "Japanese";
        }
        await game.Info.save();
      } catch (error) {}

      await delay(4000);
    }
  }
  await page.close();
  await browser.close();

  process.exit();
};

worker();
