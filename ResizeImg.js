import fs from "fs-extra";
import path from "path";
import sharp from "sharp";
import AdmZip from "adm-zip";

const checkImg = async () => {
  const rdir = path.join("/mnt/Downloads/R18/temps");
  const folders = fs.readdirSync(rdir).filter((f) => fs.statSync(path.join(rdir, f)).isDirectory());

  for (const folder of folders) {
    const fpath = path.join(rdir, folder);
    var zip = new AdmZip();
    let count = 0;
    console.log(fpath);
    for (const file of fs.readdirSync(fpath)) {
      if (/png|jpg|webp/.test(file)) {
        let img = await sharp(path.join(fpath, file));
        const meta = await img.metadata();

        if (meta.width > 1024) {
          await img.resize({ width: 1024 });
        }
        const buff = await img.jpeg({ quality: 85 }).toBuffer();
        await zip.addFile((count++).toString().padStart(3, "0") + ".jpg", buff);
      }
    }
    await zip.writeZip(fpath + ".zip");
    try {
      fs.removeSync(fpath);
    } catch (error) {
      console.log(error.toString());
    }
  }
};
checkImg();
