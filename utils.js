import drivelist from "drivelist";
import diskusage from "diskusage";
import os from "node:os";

const sizeInGB = (size) => (size / 1024 / 1024 / 1024).toFixed(1) + "GB";

const list = async () => {
  const drives = await drivelist.list();
  for (const drive of drives) {
    console.log(drive);
    // console.time("size");
    // const data = await diskusage.check(drive.mountpoints[0].path);
    // console.log(data);
    // console.log(sizeInGB(data.free), "/", sizeInGB(data.total));
    // console.timeEnd("size");
  }
  const hdata = await diskusage.check(os.platform() ? "/" : "C:\\");
  console.log(os.platform(), hdata);
};
list();
