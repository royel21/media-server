import fs from "fs-extra";
import path from "path";
import AdmZip from "adm-zip";
import sharp from "sharp";

const delay = (ms) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

const sendMessage = (data, event = "files-info") => {
  console.log(data.msg || data.text || "", data.error || "");
  process.send({ event, message: data });
};

var deleteFolderRecursive = function (basePath) {
  if (fs.existsSync(basePath)) {
    fs.readdirSync(basePath).forEach(function (file) {
      fs.removeSync(path.join(basePath, file));
    });
  }
};

export const zipImgFolder = async (data) => {
  const folders = fs.readdirSync(data.Path).filter((f) => fs.statSync(path.join(data.Path, f)).isDirectory());

  sendMessage({ text: `Zipping ${folders.length} Please Wait` }, "info");

  for (const folder of folders) {
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
    deleteFolderRecursive(fpath);
  }

  console.time("await");
  await delay(1000);
  console.timeEnd("await");

  const dirs = fs.readdirSync(data.Path);
  for (let dir of dirs) {
    const curPath = path.join(data.Path, dir);
    if (fs.statSync(curPath).isDirectory() && fs.readdirSync(curPath).length === 0) {
      fs.removeSync(curPath);
    }
  }
  sendMessage({ text: `Finish Zipping  ${folders.length} ${folders.length === 1 ? "folder" : "folders"}` }, "info");
};

export const unZip = async ({ files }) => {
  for (let file of files) {
    const zipFile = AdmZip(file.Path);
    try {
      await zipFile.extractAllTo(file.Path.replace(".zip", ""), true);
      sendMessage({ text: `${file.Name} was extracted` }, "info");
    } catch (error) {
      console.log(error);
    }
  }
  sendMessage({ text: `Finish Extrating ${files.length} ${files.length === 1 ? "File" : "Files"}` }, "info");
};
