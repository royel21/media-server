import { createPage, delay, startBrowser } from "#server/Downloader/Crawler";
import path from "node:path";
import { db } from "./server/GameModels/index.js";
import os from "os";
import fs from "fs-extra";
import { downloadImg } from "#server/Downloader/ImageUtils";

const homedir = os.homedir();

const worker = async () => {
  const browser = await startBrowser({ headless: false });

  const page = await createPage(browser);
  const games = await db.Game.findAll({
    include: [
      {
        model: db.Info,
        required: false,
        on: {
          "$Games.Codes$": { [db.Op.eq]: db.sqlze.col("Info.Codes") },
        },
      },
    ],
  });

  for (let game of games) {
    if (game.Codes !== undefined && /(r|v)\d+$/.test(game.Codes)) {
      const imgPath = path.join(homedir, "images", "games", `${game.Codes}.jpg`);
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

        data.Image = document.querySelector(".vnimg img")?.src;
        return data;
      });

      if (data.Image && !fs.existsSync(imgPath)) {
        let img = await downloadImg(data.Image, page);
        if (!img.badImg) {
          await img.resize({ width: 300 }).toFile(imgPath);
        }
      }

      if (game.Info && !game.Info.Company) {
        try {
          game.Info.Company = data.Company;
          await game.Info.save();
        } catch (error) {}
      }
      await delay(3000);
    }
  }
  await page.close();
  await browser.close();
};
//sudo certbot certonly --nginx
worker();
