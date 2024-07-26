import fs from "fs-extra";
import { createPage, startBrowser } from "./server/Downloader/Crawler.js";
import { getDb } from "./server/Downloader/db-worker.js";
import sharp from "sharp";
import AdmZip from "adm-zip";

export const downloadImg = async (url, page, cover, useAxios) => {
  if (url) {
    let buff;
    try {
      if (/%20$\/.webp$/.test(url) || useAxios) {
        const { data } = await axios(url, { responseType: "arraybuffer" });
        buff = data;
      } else if (url.includes("wordpress.com")) {
        await page.goto(url.trim());
        const result = await page.evaluate(evalWorpressImage);
        const { buffer } = parseDataUrl(result);
        buff = buffer;
      } else {
        let retry = 2;
        while (retry-- && !buff) {
          try {
            let viewSource = await page.goto(url.trim());
            buff = await viewSource.buffer();
          } catch (error) {
            console.log(error);
            if (!error.toString().includes("net::ERR_CONNECTION_CLOSED")) {
              break;
            } else {
              // sendMessage({ text: `download-Image Error`, url, color: "red", error });
            }
          }
        }
      }
    } catch (error) {
      console.log(url, error);
      // sendMessage({ text: `download-Image Error`, url, color: "red", error });
    }

    if (buff?.length > 0 && !buff.includes("<html>")) {
      try {
        const img = await sharp(buff);
        const meta = await img.metadata();

        if (!cover && meta.width < 400) return false;

        if (!cover && meta.width > 1024) {
          await img.resize({ width: 1024 });
        }

        return img;
      } catch (error) {
        // sendMessage({ text: `ResizeImage-Error: ${url}`, color: "red", error });
      }
    } else {
      // sendMessage({ text: `buffer-Error: ${url} - could't get the image`, url, color: "red" });
    }
  }
};

const links = [
  "https://www.mangaread.org/wp-content/uploads/WP-manga/data/manga_65db7bb69f233/8331815376cf381da55bb41abc88b3a7/2.jpeg",
  "https://www.mangaread.org/wp-content/uploads/WP-manga/data/manga_65db7bb69f233/8331815376cf381da55bb41abc88b3a7/3.jpeg",
  "https://www.mangaread.org/wp-content/uploads/WP-manga/data/manga_65db7bb69f233/8331815376cf381da55bb41abc88b3a7/4.jpeg",
  "https://www.mangaread.org/wp-content/uploads/WP-manga/data/manga_65db7bb69f233/8331815376cf381da55bb41abc88b3a7/5.jpeg",
  "https://www.mangaread.org/wp-content/uploads/WP-manga/data/manga_65db7bb69f233/8331815376cf381da55bb41abc88b3a7/6.jpeg",
  "https://www.mangaread.org/wp-content/uploads/WP-manga/data/manga_65db7bb69f233/8331815376cf381da55bb41abc88b3a7/7.jpeg",
  "https://www.mangaread.org/wp-content/uploads/WP-manga/data/manga_65db7bb69f233/8331815376cf381da55bb41abc88b3a7/8.jpeg",
  "https://www.mangaread.org/wp-content/uploads/WP-manga/data/manga_65db7bb69f233/8331815376cf381da55bb41abc88b3a7/9.jpeg",
  "https://www.mangaread.org/wp-content/uploads/WP-manga/data/manga_65db7bb69f233/8331815376cf381da55bb41abc88b3a7/10.jpeg",
  "https://www.mangaread.org/wp-content/uploads/WP-manga/data/manga_65db7bb69f233/8331815376cf381da55bb41abc88b3a7/11.jpeg",
  "https://www.mangaread.org/wp-content/uploads/WP-manga/data/manga_65db7bb69f233/8331815376cf381da55bb41abc88b3a7/12.jpeg",
  "https://www.mangaread.org/wp-content/uploads/WP-manga/data/manga_65db7bb69f233/8331815376cf381da55bb41abc88b3a7/13.jpeg",
  "https://www.mangaread.org/wp-content/uploads/WP-manga/data/manga_65db7bb69f233/8331815376cf381da55bb41abc88b3a7/14.jpeg",
  "https://www.mangaread.org/wp-content/uploads/WP-manga/data/manga_65db7bb69f233/8331815376cf381da55bb41abc88b3a7/15.jpeg",
  "https://www.mangaread.org/wp-content/uploads/WP-manga/data/manga_65db7bb69f233/8331815376cf381da55bb41abc88b3a7/16.jpeg",
  "https://www.mangaread.org/wp-content/uploads/WP-manga/data/manga_65db7bb69f233/8331815376cf381da55bb41abc88b3a7/17.jpeg",
  "https://www.mangaread.org/wp-content/uploads/WP-manga/data/manga_65db7bb69f233/8331815376cf381da55bb41abc88b3a7/18.jpeg",
  "https://www.mangaread.org/wp-content/uploads/WP-manga/data/manga_65db7bb69f233/8331815376cf381da55bb41abc88b3a7/19.jpeg",
  "https://www.mangaread.org/wp-content/uploads/WP-manga/data/manga_65db7bb69f233/8331815376cf381da55bb41abc88b3a7/20.jpeg",
  "https://www.mangaread.org/wp-content/uploads/WP-manga/data/manga_65db7bb69f233/8331815376cf381da55bb41abc88b3a7/21.jpeg",
];

const reset = async () => {
  const pupeteer = await startBrowser({ headless: false, userDataDir: "./user-data/puppeteer" });

  const page = await createPage(pupeteer);
  const baseP = "D:\\mangas3\\001";
  var zip = new AdmZip();
  let i = 0;
  for (const link of links) {
    const img = await downloadImg(link, page);

    if (img) {
      try {
        const buff = await img.toFormat("jpg").toBuffer();
        zip.addFile((i++).toString() + ".jpg", buff);
      } catch (error) {}
    }
  }

  zip.writeZip(baseP + ".zip");

  await pupeteer.close();

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
