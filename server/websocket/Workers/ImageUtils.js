import sharp from "sharp";
import path from "path";
import fs from "fs-extra";
import { createDir, sendMessage } from "./utils.js";
import axios from "axios";
import { delay } from "./Crawler.js";

const parseDataUrl = (dataUrl) => {
  const matches = dataUrl.match(/^data:(.+);base64,(.+)$/);
  if (matches.length !== 3) {
    throw new Error("Could not parse data URL.");
  }
  return { mime: matches[1], buffer: Buffer.from(matches[2], "base64") };
};

export const getImgNh = async (imgPath, url, page) => {
  const viewSource = await page.goto(url);
  const buffer = await viewSource.buffer();

  await new Promise((resolve) => {
    sharp(buffer)
      .jpeg()
      .toFile(imgPath, () => {
        resolve("done");
      });
  });
};

const evalWorpressImage = async () => {
  try {
    let el = document.querySelector(".the-image");
    let src = "";
    if (el) {
      src = el.src;
    } else {
      src = document.querySelector("img").src;
    }
    const response = await fetch(src);

    if (response.ok) {
      const resp = await response.blob();
      const reader = new FileReader();
      let result = await new Promise((resolve) => {
        reader.addEventListener("loadend", () => resolve(reader.result));
        reader.readAsDataURL(resp);
      });

      return result;
    }
  } catch (err) {
    throw err;
  }
};

export const downloadImg = async (imgPath, url, page, cover, useAxios) => {
  if (url) {
    let buff;
    try {
      if (/%20$/.test(url) || /manhwaclub/.test(url) || useAxios) {
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
            if (!error.toString().includes("net::ERR_CONNECTION_CLOSED")) {
              break;
            } else {
              sendMessage({ text: `download-Image Error`, url, color: "red", error });
            }
          }
        }
      }
    } catch (error) {
      console.log(url);
      sendMessage({ text: `download-Image Error`, url, color: "red", error });
    }

    if (buff && !buff.includes("html")) {
      try {
        const img = await sharp(buff);
        const meta = await img.metadata();

        if (!cover && meta.width > 400) return false;

        if (!cover && meta.width > 1024) {
          await img.resize({ width: 1024 });
        }

        await img.jpeg({ quality: 85 }).toFile(imgPath);
        if (!cover) {
          await img.destroy();
        } else {
          return img;
        }
        return true;
      } catch (error) {
        sendMessage({ text: `ResizeImage-Error: ${url}`, color: "red", error });
      }
    } else {
      sendMessage({ text: `buffer-Error: ${url} - could't get the image`, url, color: "red" });
    }
  }
};

export const createThumb = async (fromImg, toImg) => {
  if (!fs.existsSync(toImg)) {
    try {
      let img = await sharp(fromImg);
      let meta = await img.metadata();

      if (meta.height > 1650) {
        img = await img.extract({
          height: 1200,
          width: meta.width,
          top: 0,
          left: 0,
        });
      }

      await img.resize({ width: 240 }).toFile(toImg);
      await img.destroy();
    } catch (error) {
      sendMessage({ text: `Error Creating thumb: ${fromImg}`, color: "red", error });
    }
  }
};

const getPadding = (length) => (length > 999 ? 4 : length > 99 ? 3 : 2);

export const createFolderCover = async (mangaDir, data, imgPath, page) => {
  let files = [];

  createDir(mangaDir);

  files = fs.readdirSync(mangaDir);
  const poster = files.find((f) => /\.(jpg|webp|png|jpeg)/gi.test(f));
  try {
    let posterPath = path.join(mangaDir, "Cover.jpg");
    if (!poster) {
      await downloadImg(posterPath, data.poster, page, true);
    }

    let Cover = path.join(imgPath, "Folder", "mangas", data.Name + ".jpg");
    if (!fs.existsSync(Cover) && fs.existsSync(posterPath)) {
      await sharp(posterPath).jpeg().resize({ width: 240 }).toFile(Cover);
    }
  } catch (error) {
    sendMessage({ text: `Folder-Cover-Error: ${data.poster}`, color: "Red", error });
  }

  return files.filter((f) => f.includes(".zip"));
};

export const downloadAllIMages = async (page, links, dir, linkData) => {
  const length = links.length;
  let padding = getPadding(links.length);
  sendMessage({ text: `images: ${length}` });
  for (let i = 0; i < links.length; i++) {
    if (linkData.stopped) return;
    delay(60);
    process.stdout.write(`\t IMG: ${i + 1} / ${length}\r`);
    let newImg = path.join(dir, `${i}`.padStart(padding, "0") + ".jpg");

    if (!fs.existsSync(newImg)) {
      const result = await downloadImg(newImg, links[i], page);
      if (!result) --links.length;
    }
  }
};
