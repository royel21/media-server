import { createPage, delay, startBrowser } from "#server/Downloader/Crawler";
import path from "node:path";
import db from "./server/models/index.js";
import os from "os";
import fs from "fs-extra";
import { downloadImg } from "#server/Downloader/ImageUtils";

const homedir = os.homedir();

function capitalizeWords(text) {
  if (typeof text !== "string") {
    throw new TypeError("Input must be a string.");
  }

  return text
    .toLowerCase() // Normalize to lowercase first
    .replace(/\b\p{L}/gu, (char) => char.toUpperCase());
  // \b = word boundary, \p{L} = any letter (Unicode-aware)
}

const containAssianChar = /[\u3400-\u9FBF]|[\u1100-\u11FF\u3130-\u318F\uA960-\uA97F\uAC00-\uD7AF\uD7B0-\uD7FF]/u;

const format = (str) => {
  if (!str) return "";

  let text = str?.replace("–", "-").replace(/\?|\:/g, "").replace(/( )+/g, " ").replaceAll("’", "'") || "";

  text = [...new Set(text.split("\n"))];

  return text
    .sort((a, b) => {
      if (containAssianChar.test(a)) return 1;

      a.localeCompare(b);
    })
    .join("\n");
};

const codeList = fs.readJSONSync("./code-list.json");

const formatAltNames = async () => {
  const games = await db.Game.findAll({
    include: {
      model: db.Info,
      required: false,
      on: {
        "$Games.Codes$": { [db.Op.eq]: db.sqlze.col("Info.Codes") },
      },
    },
  });
  console.log("formatingAltNames: ", games.length);
  for (let { Info, Name, Codes } of games) {
    if (Info?.AltName) {
      Info.AltName = format(Info.AltName);
      Info.AltName = Info.AltName.replace(Name, "").trim();
      if (!Info.AltName) {
        Info.AltName = "N/A";
      }
      await Info.save();
    }

    if (!Info) {
      console.log(Codes);
      try {
        await db.Info.create({
          Codes,
          Lang: "Japanese",
        });
      } catch (error) {}
    }
  }

  return process.exit(0);
};

function hasAsianChar(str) {
  // Unicode ranges for CJK Unified Ideographs, Hiragana, Katakana, Hangul
  const asianRegex = /[\u4E00-\u9FFF\u3040-\u30FF\uAC00-\uD7AF]/;
  return asianRegex.test(str);
}

// Custom sort function
export function sortAsianFirst(arr) {
  return arr.slice().sort((a, b) => {
    const aAsian = hasAsianChar(a);
    const bAsian = hasAsianChar(b);

    // Asian chars first
    if (aAsian && !bAsian) return -1;
    if (!aAsian && bAsian) return 1;

    // If both same type, use localeCompare for proper alphabetical order
    return a.localeCompare(b, "zh-Hans", { sensitivity: "base" });
  });
}

const worker = async () => {
  const games = await db.Info.findAll({
    attributes: ["AltName", "Codes"],
    include: [{ model: db.Game, required: true, attributes: ["Name"] }],
  });

  // const browser = await startBrowser({ headless: false });

  // const page = await createPage(browser);
  // let i = 0;

  // let gamesFiltered = games.filter(
  //   (g) => /^v\d+$/.test(g.Codes) && !containAssianChar.test(g.AltName) && g.AltName !== "N/A",
  // );
  let count = 0;
  for (const game of games) {
    try {
      if (game.Game) {
        console.log("Processing game:", count++, game.Codes, game.Game?.Name);
        const altNames = game.AltName?.split("\n");

        for (let i = 0; i < altNames.length; i++) {
          if (game.Game && /^(~|-)/.test(altNames[i].trim())) {
            altNames[i] = game.Game.Name + altNames[i];
          }
        }
        game.AltName = sortAsianFirst(altNames).join("\n").trim();

        await game.save();
      }
    } catch (error) {
      console.log("Error saving game:", game.Codes, error);
    }

    //   console.log(`${++i}/${games.length}`.padStart(9, "0") + ": " + "Codes: " + game.Codes + " - ");

    //   if (codeList.includes(game.Codes)) {
    //     i++;
    //     continue;
    //   }

    //   codeList.push(game.Codes);

    //   if (/^v\d+$/.test(game.Codes || "")) {
    //     if (containAssianChar.test(game.AltName || "")) {
    //       continue;
    //     }

    //     const imgPath = path.join(homedir, "images", "games", `${game.Codes}.jpg`);
    //     await page.goto("https://vndb.org/" + game.Codes);
    //     const data = await page.evaluate(async () => {
    //       const data = {};
    //       let list = [...document.querySelectorAll("table td")];
    //       let index = 0;
    //       list.forEach((td, i) => {
    //         if ((!data.Company && td.textContent.includes("Publisher")) || td.textContent.includes("Developer")) {
    //           data.Company = list[i + 1].textContent.split("&")[0].trim();
    //         }
    //         if (td.textContent.includes("Aliases")) {
    //           data.Aliase = list[i + 1].textContent.trim();
    //         }
    //       });

    //       data.AltName = document.querySelector(".alttitle")?.textContent.trim();

    //       data.Image = document.querySelector(".vnimg img")?.src;
    //       return data;
    //     });

    //     console.log(game.Codes, data);

    //     if (data.Image && !fs.existsSync(imgPath)) {
    //       let img = await downloadImg(data.Image, page);
    //       if (!img.badImg) {
    //         await img.resize({ width: 450 }).toFile(imgPath);
    //       }
    //     }

    //     if (data.Company && !game.Company) {
    //       game.Company = capitalizeWords(data.Company || "");
    //     }

    //     if (data.AltName && !game.AltName?.includes(data.AltName)) {
    //       if (game.AltName) {
    //         game.AltName = data.AltName + "\n" + game.AltName;
    //       } else {
    //         game.AltName = data.AltName;
    //       }
    //       console.log("AltName-update: ", game.AltName);
    //     }

    //     game.AltName?.replace("undefined", "");

    //     if (data.Aliase) {
    //       game.AltName?.replace(data.Aliase?.trim(), "");

    //       for (let a of data.Aliase.split(", ")) {
    //         let atemp = a.trim();
    //         if (atemp && !game.AltName?.includes(atemp)) {
    //           game.AltName?.replace(atemp, "");
    //           game.AltName = `${game.AltName}\n${atemp}`.trim();
    //         }
    //       }
    //       console.log("- aliase added -");
    //     }

    //     game.AltName = game.AltName?.trim() || "";

    //     if (!game.OS) {
    //       data.OS = "Windows";
    //     }

    //     if (!game.Lang) {
    //       data.Lang = "Japanese";
    //     }

    //     await delay(4000);
    //   }

    //   if (!game.OS || game.OS === "Windows 10") game.OS = "Windows";

    //   try {
    //     await game.save();
    //   } catch (error) {
    //     console.log("save failed", error);
    //   }
    //   fs.writeJSONSync("./code-list.json", codeList);
  }

  // formatAltNames();
  // await page.close();
  // await browser.close();
  process.exit();
};

worker();
