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
    config.executablePath = "/usr/bin/brave-browser";
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
    await page.evaluateOnNewDocument(() => {
      const toLowerList = /^(For|No|It|Of|And|In|X|Du|Or|A|Wa|wo|na|to|ni|de|o|by)$/i;

      window.capitalize = (val, splitter = " ", Preserve = true) => {
        let words = val.replace(/( )+/g, " ").split(splitter);

        if (words.length > 1) {
          for (let i = 0; i < words.length; i++) {
            if (i == 0 && words[i].length === 1) {
              words[i] = words[i].toUpperCase();
              continue;
            }

            if (toLowerList.test(words[i])) {
              words[i] = words[i].toLowerCase();
              continue;
            }

            if (words[i].length > 1) {
              let word = words[i];
              //find first letter index
              const index = word.split("").findIndex((c) => /[a-z]/i.test(c));
              if (index > -1) {
                words[i] = word.slice(0, index + 1).toUpperCase();
                if (Preserve) {
                  words[i] += word.slice(index + 1);
                } else {
                  words[i] += word.slice(index + 1).toLowerCase();
                }
              }
            }
          }
        }

        let result = words.join(splitter).trim() || "";

        const found = result.match(/(\.|,) [a-z] /gi);
        if (found) {
          result = result.replace(found[0], found[0].toUpperCase());
        }

        return result;
      };
    });
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
