import fs from "fs-extra";
import path from "path";
import AdmZip from "adm-zip";

const baseDir = "/mnt/Downloads/R18/temps";

const extra = async () => {
  const files = fs.readdirSync(baseDir).filter((f) => /\.zip/.test(f));

  for (let zip of files) {
    console.log(`Extrating: ${zip}`);
    const zipFile = AdmZip(path.join(baseDir, zip));
    await zipFile.extractAllTo(path.join(baseDir, zip.replace(".zip", "")), true);
    console.log(`finish: ${zip}`);
    fs.removeSync(path.join(baseDir, zip));
  }
};
extra();
