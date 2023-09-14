import { fork, spawnSync } from "child_process";

let downloader;

export const download = async (data) => {
  console.log(data);

  if (!downloader) {
    spawnSync("rm", [".", "user-data/puppeteer/SingletonLock"]);
    downloader = fork(appPath + "/websocket/Workers/Worker.js");
    downloader.on("exit", () => {
      downloader = null;
    });

    downloader.on("message", (info) => {
      if (info.event === "update-download") {
        io.sockets.emit("update-download", info);
      } else {
        io.sockets.emit("info", info.data);
      }
    });
  }
  downloader?.send({ ...data, headless: true, bypass: true });
};
