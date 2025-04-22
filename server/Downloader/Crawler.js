import puppeteer from "puppeteer-extra";
import os from "node:os";

import StealthPlugin from "puppeteer-extra-plugin-stealth";
puppeteer.use(StealthPlugin());

import addBlocker from "puppeteer-extra-plugin-adblocker";
puppeteer.use(addBlocker());

export const delay = (ms) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

const userAgent =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36 Edg/135.0.0.0";

export const createPage = async (browser, timeout = 180000) => {
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 800 });
  await page.setDefaultNavigationTimeout(timeout);

  await page._client().send("Page.setLifecycleEventsEnabled", { enabled: true });
  await page._client().send("Network.enable", {
    maxResourceBufferSize: 1024 * 1024 * 400,
    maxTotalBufferSize: 1024 * 1204 * 400,
  });

  // await page.evaluateOnNewDocument(() => { });
  await page.setUserAgent(userAgent);
  console.log(await browser.userAgent());
  return page;
};

let pupeteer;

export const startBrowser = async (config) => {
  console.log(process.env.DISPLAY);
  config.args = [...(config.args || []), "--no-sandbox", "--disable-gpu"];

  if (os.platform() === "win32") {
    config.executablePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
  } else {
    config.args.push(`--display=${":10.0"}`); // fix for LXDE desktops)
    config.executablePath = "/usr/bin/microsoft-edge";
  }
  config.headless = "new";
  pupeteer = await puppeteer.launch(config);

  return pupeteer;
};

export const getPages = async () => {
  const p = await pupeteer?.pages();
  return p?.length || 1;
};
