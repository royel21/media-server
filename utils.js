import fs from "fs-extra";
import { startBrowser } from "./server/Downloader/Crawler.js";

const reset = async () => {
  // const pupeteer = await startBrowser({ headless: "new", userDataDir: "./user-data/puppeteer" });
  // await pupeteer.close();

  let maxNum = 0;
  ["100", "999", "300", "0", "45"].forEach((a) => {
    try {
      let num = +a;
      if (maxNum < num) {
        maxNum = num;
      }
    } catch (error) {}
  });

  const padding = maxNum > 950 ? 4 : 3;

  console.log(padding);
};
reset();
