import sharp from "sharp";
import path from "path";
import fs from "fs-extra";
import { getProgress, sendMessage } from "../utils.js";
import axios from "axios";
import defaultConfig from "../default-config.js";
import AdmZip from "adm-zip";

const delay = (ms) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

const parseDataUrl = (dataUrl) => {
  const matches = dataUrl.match(/^data:(.+);base64,(.+)$/);
  if (matches.length !== 3) {
    throw new Error("Could not parse data URL.");
  }
  return { mime: matches[1], buffer: Buffer.from(matches[2], "base64") };
};

export const getImgNh = async (url, page) => {
  const viewSource = await page.goto(url);
  const buffer = await viewSource.buffer();

  if (buffer.slice(0, 40).includes("html")) {
    return { badImage: true };
  }

  const img = await sharp(buffer, { failOnError: false });
  const meta = await img.metadata();

  if (meta.width > 960) {
    await img.resize({ width: 960 });
  }

  return img;
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

const downloadImg = async (url, page, name = "", isCover) => {
  if (url) {
    let buff = [];
    try {
      if (/%20$/.test(url)) {
        const { data } = await axios(url, { responseType: "arraybuffer" });
        buff = data;
      } else if (url.includes("wordpress.com") || url.includes("imgur.com")) {
        await page.goto(url.trim());
        const result = await page.evaluate(evalWorpressImage);
        const { buffer } = parseDataUrl(result);
        buff = buffer;
      } else {
        let retry = 2;
        while (retry-- && (buff.length === 0 || !buff?.includes("<html>"))) {
          try {
            let viewSource = await page.goto(url.trim(), { timeout: 30000 });
            buff = await viewSource.buffer();
          } catch (error) {
            if (!error.toString().includes("net::ERR_CONNECTION_CLOSED")) {
              break;
            }
            await delay(2000);
          }
        }
      }
    } catch (error) {
      console.log(url, error);
      sendMessage({ text: `${name} download-Image Error`, url, color: "red", error: error.toString() });
    }

    await delay(100);
    if (buff?.length > 0 && !buff.includes("<html>")) {
      try {
        const img = await sharp(buff, { failOnError: false });
        const meta = await img.metadata();

        if (!isCover && meta.width < 200) {
          return { badImg: true, width: meta.width };
        }

        if (meta.width > 1024) {
          await img.resize({ width: 1024 });
        }

        return img;
      } catch (error) {
        console.log(error);
        sendMessage({ text: `${name} ResizeImage-Error: ${url}`, color: "red", error: error.toString(), url });
      }
    } else {
      sendMessage({ text: `${name} buffer-Error: ${url} - could't get the image`, url, color: "red" });
      return { badImg: true };
    }
    return {};
  }
};

const getPadding = (length) => (length > 999 ? 4 : length > 99 ? 3 : 2);

export const createFolderCover = async (mangaDir, data, page, update) => {
  let files = [];
  let result = false;
  try {
    let posterPath = path.join(mangaDir, "Cover.jpg");
    let poster = false;

    files = fs.readdirSync(mangaDir);
    poster = files.find((f) => /\.(jpg|webp|png|jpeg)/gi.test(f));

    if (!poster || update) {
      result = await downloadImg(data.poster, page, "", true);
      if (result.jpeg) {
        await result.jpeg().toFile(posterPath);
      } else {
        return;
      }
    }

    let Cover = path.join(defaultConfig.ImagesDir, "Folder", data.type, data.Name + ".jpg");
    if ((!fs.existsSync(Cover) && fs.existsSync(posterPath)) || update) {
      await sharp(posterPath).toFormat("jpg").resize({ width: 340 }).toFile(Cover);
    }
    result = true;
  } catch (error) {
    result = false;
    sendMessage({ text: `Folder-Cover-Error: ${data.poster}`, color: "Red", error });
  }

  return { files: files.filter((f) => f.includes(".zip")), result };
};

export const saveThumbnail = async (buff, thumbPath) => {
  let img = sharp(buff, { failOnError: false });
  const meta = await img.metadata();
  try {
    if (meta.height > 300) {
      if (meta.height > 1650) {
        img = await img.extract({
          height: 1200,
          width: meta.width,
          top: 0,
          left: 0,
        });
      }

      await img.toFormat("jpg").resize({ width: 340 }).toFile(thumbPath);
      await img.destroy();
      return true;
    }
  } catch (error) {
    console.log(error);
  }
};

export const downloadAllIMages = async (page, links, state, imgPath, folder, destZip) => {
  var zip = new AdmZip();

  links = links.filter((link) => link?.startsWith("http"));

  let length = links.length;
  let padding = getPadding(length);
  const result = { valid: false, count: 0 };
  let thumb = 0;
  let skip = 0;
  for (let i = 0; i < length; i++) {
    if (state.stopped) return result;

    if (skip > 1) {
      sendMessage({ text: `Error Skip: ${links[i]}` });
      // return result;
    }

    process.stdout.write(`IMG: ${getProgress(i + 1, length)}\r`);

    const img = await downloadImg(links[i], page, folder);
    if (img.badImg) {
      length--;
      thumb++;
      skip++;
      continue;
    }

    if (img && img.toFormat) {
      try {
        const newImg = `${i}`.padStart(padding, "0") + ".jpg";
        const buff = await img.toFormat("jpg").toBuffer();

        if (i === thumb && !fs.existsSync(imgPath)) {
          const isSave = await saveThumbnail(buff, imgPath);
          if (!isSave) {
            thumb++;
          } else {
            thumb = 0;
          }
        }
        zip.addFile(newImg, buff);
      } catch (error) {
        console.log(links[i], error);
      }

      result.count++;
    }
  }

  result.valid = result.count >= length - 1 && result.count > 0;

  if (result.valid) {
    zip.writeZip(destZip);
  }
  return result;
};
