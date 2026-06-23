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

const codeList = fs.readJSONSync("./code-list.json");

const worker = async () => {
  const games = await db.Info.findAll({ where: { Codes: { [db.Op.like]: "v%" } }, includes: db.Games, required: true });
  // const games = await db.Game.findAll();

  const containAssianChar = /[\u3400-\u9FBF]|[\u1100-\u11FF\u3130-\u318F\uA960-\uA97F\uAC00-\uD7AF\uD7B0-\uD7FF]/u;
  const browser = await startBrowser({ headless: false });

  const page = await createPage(browser);
  let i = 0;
  for (const game of games.filter((g) => !containAssianChar.test(g.AltName || "") && g.AltName !== "N/A")) {
    await game.reload();
    game.Codes = game.Codes.trim();

    console.log(`${++i}/${games.length}`.padStart(9, "0") + ": " + "Codes: " + game.Codes + " - ");
    if (codeList.includes(game.Codes)) {
      i++;
      continue;
    }

    codeList.push(game.Codes);

    if (/^v\d+$/.test(game.Codes || "")) {
      if (containAssianChar.test(game.AltName || "")) {
        continue;
      }

      await page.goto("https://vndb.org/" + game.Codes);
      const data = await page.evaluate(async () => {
        const data = {};
        let list = [...document.querySelectorAll("table td")];
        let index = 0;
        list.forEach((td, i) => {
          if ((!data.Company && td.textContent.includes("Publisher")) || td.textContent.includes("Developer")) {
            data.Company = list[i + 1].textContent.split("&")[0].trim();
          }
          if (td.textContent.includes("Aliases")) {
            data.Aliase = list[i + 1].textContent.trim();
          }
        });

        data.AltName = document.querySelector(".alttitle")?.textContent.trim();

        data.Image = document.querySelector(".vnimg img")?.src;
        return data;
      });

      console.log(game.Codes, data);

      if (data.Image && !fs.existsSync(imgPath)) {
        let img = await downloadImg(data.Image, page);
        if (!img.badImg) {
          await img.resize({ width: 450 }).toFile(imgPath);
        }
      }

      if (data.Company && !game.Company) {
        game.Company = capitalizeWords(data.Company || "");
      }

      if (data.AltName && !game.AltName?.includes(data.AltName)) {
        if (game.AltName) {
          game.AltName = data.AltName + "\n" + game.AltName;
        } else {
          game.AltName = data.AltName;
        }
        console.log("AltName-update: ", game.AltName);
      }

      if (!game.OS) {
        data.OS = "Windows";
      }

      if (!game.Lang) {
        data.Lang = "Japanese";
      }

      await delay(4000);
    }

    if (!game.OS || game.OS === "Windows 10") game.OS = "Windows";

    try {
      await game.save();
    } catch (error) {
      console.log("save failed", error);
    }
    fs.writeJSONSync("./code-list.json", codeList);
  }
  await page.close();
  await browser.close();
  process.exit();
};

worker();
