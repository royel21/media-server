import fs from "fs-extra";
import { startBrowser } from "./server/Downloader/Crawler.js";
import { getDb } from "./server/Downloader/db-worker.js";

const reset = async () => {
  const db = getDb();
  const folders = await db.folder.findAll();
  for (const f of folders) {
    if (!fs.existsSync(f.Path)) {
      console.log(f.Path)
      fs.mkdirsSync(f.Path);
    }
  }
  // const pupeteer = await startBrowser({ headless: false, userDataDir: "./user-data/puppeteer" });
  // console.log(pupeteer);
  // await pupeteer.close();

  // // let maxNum = 0;
  // // ["100", "999", "300", "0", "45"].forEach((a) => {
  // //   try {
  // //     let num = +a;
  // //     if (maxNum < num) {
  // //       maxNum = num;
  // //     }
  // //   } catch (error) {}
  // // });

  // // const padding = maxNum > 950 ? 4 : 3;

  // // console.log(padding);
};
reset();
