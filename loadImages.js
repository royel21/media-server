import { createPage, delay, startBrowser } from "#server/Downloader/Crawler";
import path from "node:path";
import db from "./server/models/index.js";
import os from "os";
import fs from "fs-extra";
import { downloadImg } from "#server/Downloader/ImageUtils";

const homedir = os.homedir();

function capitalizeWords(text) {
  if (typeof text !== "string") {
    throw new TypeError("Input must be a string.");
  }

  return text
    .toLowerCase() // Normalize to lowercase first
    .replace(/\b\p{L}/gu, (char) => char.toUpperCase());
  // \b = word boundary, \p{L} = any letter (Unicode-aware)
}

const worker = async () => {
  const games = await db.Info.findAll();

  const containAssianChar = /[\u3400-\u9FBF]|[\u1100-\u11FF\u3130-\u318F\uA960-\uA97F\uAC00-\uD7AF\uD7B0-\uD7FF]/g;
  const browser = await startBrowser({ headless: false });

  const page = await createPage(browser);
  for (const game of games) {
    game.Codes = game.Codes.trim();

    if (game.Codes.includes(" ")) continue;

    if (/(r|v)\d+$/.test(game.Codes || "")) {
      if (containAssianChar.test(game.AltName || "")) {
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
      console.log(data);
      try {
        if (!game.Company) {
          game.Company = capitalizeWords(data.Company || "");
        }
        if (!game.AltName.includes(data.AltName)) {
          if (game.AltName) {
            game.AltName = data.AltName + "\n" + game.AltName;
          } else {
            game.AltName = data.AltName;
          }
        }

        if (!game.OS) {
          game.OS = "Windows";
        }

        if (!game.Lang) {
          game.Lang = "Japanese";
        }
      } catch (error) {
        console.log("save failed", error);
      }

      await delay(4000);
    }

    if (!game.OS || game.OS === "Windows 10") game.OS = "Windows";

    await game.save();
  }
  await page.close();
  await browser.close();
  process.exit();
};

worker();
