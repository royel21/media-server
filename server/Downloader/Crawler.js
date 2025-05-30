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
    await page.evaluateOnNewDocument(() => {
      function containsJapaneseOrChinese(text) {
        return /[\u3400-\u9FBF]|[\u1100-\u11FF\u3130-\u318F\uA960-\uA97F\uAC00-\uD7AF\uD7B0-\uD7FF]/g.test(text);
      }

      window.fixAltName = (AltName) => {
        const names = [...new Set(AltName.split("; "))];

        const removeDub = (items) => (n1) => items.filter((n2) => n2.includes(n1)).length === 1;

        const sortJapFirst = (a) => {
          if (containsJapaneseOrChinese(a)) {
            return -1;
          }
          return 0;
        };

        return names.filter(removeDub(names)).sort(sortJapFirst).join("; ");
      };

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
