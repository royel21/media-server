import { sendMessage } from "#server/utils";
import diskusage from "diskusage";
import os from "node:os";
import fs from "fs-extra";
import drivelist from "drivelist";
import path from "path";
import { nanoid } from "nanoid";

const sizeInGB = (size) => (size / 1024 / 1024 / 1024).toFixed(1) + "GB";

const loadDisk = async () => {
  const drives = await drivelist.list();
  const disks = [];
  for (const drive of drives) {
    if (drive.mountpoints.length > 0) {
      let mp = drive.mountpoints[0];
      if (mp.path.includes("/boot")) continue;

      const data = await diskusage.check(mp.path);
      const Name = `${mp.label || path.basename(mp.path) || mp.path}`;

      if (Name === "C:\\") {
        continue;
      }

      disks.push({
        Id: nanoid(5),
        Name,
        Path: mp.path,
        Content: [],
        Free: sizeInGB(data.free),
        Used: sizeInGB(data.total - data.free),
        Size: sizeInGB(data.total),
      });
    }
  }

  if (os.platform() === "linux") {
    let founds = fs.readdirSync("/mnt");

    for (let Name of founds) {
      const Path = path.join("/mnt", Name);
      if (!disks.find((d) => d.Name === Name) && fs.readdirSync(Path).length > 0) {
        disks.push({
          Id: nanoid(5),
          Name,
          Path,
          Content: [],
          Free: "N/A",
          Used: "N/A",
          Size: "N/A",
        });
      }
    }
  }

  disks.sort((a, b) => {
    const num1 = a.Name.match(/\d+/);
    const num2 = b.Name.match(/\d+/);

    if (num1 && num2) {
      return +num1[0] - +num2[0];
    }

    return a.Name.localeCompare(b.Name);
  });

  const hdata = await diskusage.check(os.platform() === "win32" ? "C:\\" : "/");

  disks.unshift({
    Id: nanoid(5),
    Name: "Home",
    Path: `homedir`,
    Content: [],
    Free: sizeInGB(hdata.free),
    Used: sizeInGB(hdata.total - hdata.free),
    Size: sizeInGB(hdata.total),
  });

  await sendMessage(disks, "disk-loaded", false);
};

const actions = {
  loadDisk,
};

const works = {
  isWorking: false,
  pendding: [],
};

const startToWork = async () => {
  works.isWorking = true;
  while (works.pendding.length) {
    const work = works.pendding.shift();
    if (actions[work.action]) {
      const result = await actions[work.action](work.data);
      if (result) {
        await result();
      }
    }
  }
  console.log("Finish File Work");
  process.exit();
};

process.on("message", (work) => {
  works.pendding.push(work);
  if (!works.isWorking) startToWork();
});
