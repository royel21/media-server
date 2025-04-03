import fs from "fs-extra";

const list = async () => {
  const folders = fs.readdirSync("/mnt/5TB/").filter((f) => !/Anime|R18/i.test(f));

  for (let folder of folders) {
    console.log("Moving", folder);
    const path = `/mnt/5TB/${folder}`;
    fs.moveSync(path, `/mnt/5TB/Anime/${folder}`, { overwrite: true });
  }
};
list();
