import puppeteer from "puppeteer-extra";
import os from "node:os";
import UserAgent from "user-agents";

import addBlocker from "puppeteer-extra-plugin-adblocker";
puppeteer.use(addBlocker());

export const delay = (ms) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

let pupeteer;

export const startBrowser = async (config) => {
  config.args = [...(config.args || []), "--no-sandbox", "--disable-gpu"];
  config.userDataDir = "./user-data/puppeteer";

  if (os.platform() === "win32") {
    config.executablePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
  } else {
    config.args.push(`--display=${":1"}`); // fix for LXDE desktops)
    config.executablePath = "/usr/bin/microsoft-edge";
    //microsoft-edge
    //google-chrome
    //google-chrome-stable
  }
  config.headless = false; //"new";
  pupeteer = await puppeteer.launch(config);

  return pupeteer;
};

export const createPage = async (browser, timeout = 180000) => {
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 800 });
    await page.setDefaultNavigationTimeout(timeout);

    await page._client().send("Page.setLifecycleEventsEnabled", { enabled: true });
    await page._client().send("Network.enable", {
      maxResourceBufferSize: 1024 * 1024 * 400,
      maxTotalBufferSize: 1024 * 1204 * 400,
    });
    const userAgent = new UserAgent().random().toString();
    // await page.evaluateOnNewDocument(() => { });
    await page.setUserAgent(userAgent);
    return page;
  } catch (error) {
    console.log(error);
  }
};

export const getPages = async () => {
  const p = await pupeteer?.pages();
  return p?.length || 1;
};
