import puppeteer from "puppeteer-extra";

import StealthPlugin from "puppeteer-extra-plugin-stealth";
puppeteer.use(StealthPlugin());

// const addBlocker from "puppeteer-extra-plugin-adblocker");
// puppeteer.use(addBlocker());

// const puppeteer from "puppeteer-core");
export const delay = (ms) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};
//Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36 Edg/115.0.1901.203
//Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36 Edg/115.0.1901.188
export const createPage = async (browser) => {
  const page = await browser.newPage();
  // page.setUserAgent(
  //   "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36 Edg/115.0.1901.203"
  // );
  await page.setViewport({ width: 1200, height: 800 });
  await page.setDefaultNavigationTimeout(180000);

  await page._client().send("Page.setLifecycleEventsEnabled", { enabled: true });
  await page._client().send("Network.enable", {
    maxResourceBufferSize: 1024 * 1024 * 400,
    maxTotalBufferSize: 1024 * 1204 * 400,
  });

  await page.evaluateOnNewDocument(() => {
    if (location.href.includes("mangas.in")) {
      window.confirm = () => {
        throw new Error("Parameter is not a number!");
      };
      window.alert = () => {
        throw new Error("Parameter is not a number!");
      };
    } else {
      // window.confirm = () => true;
      // window.alert = () => true;
    }
  });

  return page;
};

let pupeteer;

export const startBrowser = async (config) => {
  try {
    if (pupeteer) {
      await pupeteer.close();
      delay(500);
      pupeteer = null;
    }
    config.args = ["--no-sandbox"];
    pupeteer = await puppeteer.launch(config);
  } catch (error) {
    console.log("Some error", error);
  }

  return pupeteer;
};