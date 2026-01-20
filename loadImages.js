import { createPage, getPages, startBrowser } from "#server/Downloader/Crawler";
import path from "node:path";
import { db } from "./server/GameModels/index.js";
import os from "os";

const homedir = os.homedir();

const worker = async () => {
  const browser = await startBrowser({ headless: false });

  const page = await createPage(browser);
  const games = (games = await db.Game.findAndCountAll({
    where: filters,
    order: [sortByName],
    offset,
    limit: rows,
    include: [
      {
        model: db.Info,
        required: false,
        on: {
          "$Games.Codes$": { [db.Op.eq]: db.sqlze.col("Info.Codes") },
        },
      },
    ],
  }));

  for (let game of games) {
    if (game.Codes && /(r|v)\d+$/.test(game.Codes)) {
      await page.goto("vndb.org/" + games.Codes);

      const data = page.evaluate(async () => {
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

        data.Image = document.querySelector(".vnimg img");
      });
      if (data.Image) {
        let img = await downloadImg(data.Image, page);
        if (!img.badImg) {
          const imgPath = path.join(homedir, "game", `${game.Codes}.jpg`);
          await img.reisze(300).toFile(imgPath);
        }
      }

      if (game.Info) {
        game.Info.Company = data.Company;
      }
      await delay(3000);
    }
  }

  await browser.close();
};

worker();
