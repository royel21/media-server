import puppeteer from "puppeteer-extra";
import puppeteerCore from "puppeteer-core";
import os from "node:os";
import { sendMessage } from "./utils.js";

import StealthPlugin from "puppeteer-extra-plugin-stealth";
puppeteer.use(StealthPlugin());

import addBlocker from "puppeteer-extra-plugin-adblocker";
puppeteer.use(addBlocker());

export const delay = (ms) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};
//Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36 Edg/115.0.1901.203
//Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36 Edg/115.0.1901.188
//Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36
//Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36
const userAgent =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36 Edg/126.0.0.0";
export const createPage = async (browser, timeout = 180000) => {
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 800 });
  await page.setDefaultNavigationTimeout(timeout);

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
  await page.setUserAgent(userAgent);
  // await page.goto("http:\\www.google.com");
  return page;
};

let pupeteer;

export const startBrowser = async (config) => {
  config.args = ["--no-sandbox", "--disable-gpu"];
  config.headless = "new";
  if (process.env.USE_DEV && os.platform() === "win32") {
    config.headless = false;
    config.executablePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
    pupeteer = await puppeteerCore.launch(config);
  } else {
    pupeteer = await puppeteer.launch(config);
  }

  return pupeteer;
};

export const getPages = async () => {
  const p = await pupeteer?.pages();
  return p?.length || 1;
};
