import fs from "fs-extra";
import path from "path";
import sharp from "sharp";
import AdmZip from "adm-zip";

var deleteFolderRecursive = function (basePath) {
  if (fs.existsSync(basePath)) {
    fs.readdirSync(basePath).forEach(function (file, index) {
      fs.removeSync(path.join(basePath, file));
    });
  }
};

const checkImg = async () => {
  const rdir = path.join("/mnt/Downloads/R18/temps");
  const folders = fs.readdirSync(rdir).filter((f) => fs.statSync(path.join(rdir, f)).isDirectory());

  for (const folder of folders) {
    const fpath = path.join(rdir, folder);
    var zip = new AdmZip();
    let count = 0;
    console.log(fpath);

    const files = fs.readdirSync(fpath);
    if (!files.length) continue;

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

  const dirs = fs.readdirSync(rdir);
  for (let dir of dirs) {
    const curPath = path.join(rdir, dir);
    if (fs.statSync(curPath).isDirectory() && fs.readdirSync(curPath).length === 0) {
      fs.removeSync(curPath);
    }
  }
};
checkImg();
