import fs from "fs-extra";
import path from "path";
import AdmZip from "adm-zip";
import StreamZip from "node-stream-zip";
import sharp from "sharp";
import { getProgress, sendMessage } from "../utils.js";

var deleteFolderRecursive = function (basePath) {
  if (fs.existsSync(basePath)) {
    fs.readdirSync(basePath).forEach(function (file) {
      fs.removeSync(path.join(basePath, file));
    });
  }
};

export const zipImgFolder = async (data) => {
  const folders = fs.readdirSync(data.Path).filter((f) => fs.statSync(path.join(data.Path, f)).isDirectory());

  await sendMessage({ text: `Zipping ${folders.length} Please Wait` });

  for (const [i, folder] of folders.entries()) {
    const fpath = path.join(data.Path, folder);
    var zip = new AdmZip();
    let count = 0;

    const files = fs.readdirSync(fpath);
    if (!files.length || files.find((f) => !/png|jpg|webp/.test(f))) continue;

    for (const file of files) {
      if (/png|jpg|webp/.test(file)) {
        let img = await sharp(path.join(fpath, file));
        const meta = await img.metadata();

        if (meta.width > 960) {
          await img.resize({ width: 960 });
        }
        const buff = await img.toFormat("jpg").toBuffer();
        await zip.addFile((count++).toString().padStart(3, "0") + ".jpg", buff);
      }
    }
    await zip.writeZip(fpath + ".zip");
    await sendMessage({
      text: `${getProgress(i + 1, folders.length)} ${folder} was Zipped`,
    });
    deleteFolderRecursive(fpath);
  }

  await sendMessage({ text: `Finish Zipping  ${folders.length} ${folders.length === 1 ? "folder" : "folders"}` });

  return () => {
    const dirs = fs.readdirSync(data.Path);
    for (let dir of dirs) {
      const curPath = path.join(data.Path, dir);
      if (fs.statSync(curPath).isDirectory() && fs.readdirSync(curPath).length === 0) {
        fs.removeSync(curPath);
      }
    }
  };
};

export const unZip = async ({ files }) => {
  for (let file of files) {
    const zipFile = AdmZip(file.Path);
    try {
      await zipFile.extractAllTo(file.Path.replace(".zip", ""), true);
      await sendMessage({ text: `${file.Name} was extracted` });
    } catch (error) {
      console.log(error);
    }
  }
  await sendMessage({ text: `Finish Extrating ${files.length} ${files.length === 1 ? "File" : "Files"}` });
};

const sortByName = (a, b) => String(a.name).localeCompare(String(b.name));

export const combinedZip = async ({ files }) => {
  if (!files?.length) {
    return;
  }

  const basePath = path.dirname(files[0].Path);
  const name = path.basename(files[0].Path).replace(".zip", "");

  await sendMessage({ text: `Combining Files ${files.length} - ${basePath}` });

  let zip = new AdmZip();
  let i = 0;

  for (const file of files) {
    const zipfile = new StreamZip.async({ file: file.Path });

    const entries = Object.values(await zipfile.entries()).sort(sortByName);

    for (const entry of entries) {
      const buff = await zipfile.entryData(entry);
      await zip.addFile(i.toString().padStart(3, "0") + ".jpg", buff);
      i++;
    }
    await zipfile.close();
  }
  zip.writeZip(path.join(basePath, name + "-cmb.zip"));
  await sendMessage({ text: `Finish Combining - ${basePath}`, combining: true });
  await sendMessage({ combining: true }, "files-info");
};

const sortEntries = (a, b) => String(a.entryName).localeCompare(String(b.entryName));
export const delImageZip = async ({ files, removeList }) => {
  if (!files?.length) {
    return;
  }

  await sendMessage({ text: `Removing Images From Zip` });

  for (const file of files) {
    try {
      const zip = new AdmZip(file.Path);

      const list = file?.removeList || removeList;
      console.log(list);
      if (!list?.length) {
        continue;
      }

      let zipEntries = [...zip.getEntries().sort(sortEntries)];
      let toRemove = list.split(",");

      for (const i of toRemove) {
        let index = parseInt(i);

        if (index > 0) {
          index = index - 1;
        }

        let entry = zipEntries[index];
        if (+i === -1) {
          entry = zipEntries[zipEntries.length + index];
        }
        if (entry) {
          zip.deleteFile(entry);
        }
      }

      zip.writeZip(file.Path);
    } catch (error) {
      await sendMessage({ text: `Error While Removing Images From Zip ${error.toString()}`, color: "red" });
    }
  }

  await sendMessage({ text: `Finish Removing Images From Zip` });
};

export const cropImageInZip = async ({ files, image, top, left, width, height }) => {
  if (!files.length) return;

  if (height === 0 || width === 0) {
    return await sendMessage({ text: `Width or Height can't be 0` });
  }
  const basePath = path.dirname(files[0].Path);

  await sendMessage({ text: `Cropping ${files.length} Files` });
  for (const file of files) {
    try {
      const zip = new AdmZip(file.Path);

      await sendMessage({ text: `Croping ${file.Path}` });

      let zipEntries = [...zip.getEntries().sort(sortEntries)];

      const entry = zipEntries[+image - 1];

      let img = await sharp(entry.getData());

      const meta = await img.metadata();
      let w = width;
      if (+width < 0) {
        w = meta.width - left;
      }

      let h = height;
      if (+height < 0) {
        h = meta.height - top;
      }

      if (h < 0) {
        await sendMessage({ text: `Error Cropping Height ${h} can't be negative`, color: "red" });
        continue;
      }

      img = await img.extract({
        top: top,
        left: left,
        width: w,
        height: h,
      });

      await img.toFile("./0.jpg");

      zip.addFile(entry.name, await img.toBuffer());

      const name = path.basename(file.Name).replace(".zip", "");
      zip.writeZip(path.join(basePath, name + "-c.zip"));
    } catch (error) {
      console.log(error);
      await sendMessage({ text: `Error Cropping ${file.Name} ${error.toString()}`, color: "red" });
    }
  }
  await sendMessage({ text: `Finish Cropping ${files.length} Files` });
  await sendMessage({ combining: true }, "files-info");
};
