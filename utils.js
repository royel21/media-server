import fs from "fs-extra";
import { startBrowser } from "./server/Downloader/Crawler.js";

const reset = async () => {
  const pupeteer = await startBrowser({ headless: "new", userDataDir: "./user-data/puppeteer" });
  await pupeteer.close();
};
reset();
