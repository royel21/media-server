import drivelist from "drivelist";
import checkDiskSpace from "check-disk-space";
import diskusage from "diskusage";

const sizeInGB = (size) => (size / 1024 / 1024 / 1024).toFixed(1) + "GB";

const list = async () => {
  const drives = await drivelist.list();
  for (const drive of drives) {
    console.log(drive.mountpoints[0]);
    console.time("size");
    const data = await diskusage.check(drive.mountpoints[0].path);
    console.log(data);
    console.log(sizeInGB(data.free), "/", sizeInGB(data.total));
    console.timeEnd("size");
  }
};
list();
