import { fork, spawnSync } from "child_process";

let downloader = null;

export const download = async (data) => {
  if (data.action === "is-running") {
    return global.io.sockets.emit("is-running", { IsRunning: downloader != null });
  }

  if (!downloader) {
    spawnSync("rm", [".", "user-data/puppeteer/SingletonLock"]);
    downloader = fork(appPath + "/Downloader/Worker.js");
    downloader.on("exit", () => {
      global.io.sockets.emit("is-running", { IsRunning: false });
      downloader = null;
    });

    downloader.on("message", (info) => {
      if (info.event === "update-download") {
        global.io.sockets.emit("update-download", info);
      } else {
        global.io.sockets.emit("info", info.data);
      }
    });
  }
  downloader?.send({ ...data, headless: true, bypass: true });
};
