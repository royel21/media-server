import downloadDB from "./Models/index.js";
import { fork, spawnSync } from "child_process";

let downloader;

export const downloadFromPage = async ({ name }) => {
  spawnSync("rm", [".", "user-data/puppeteer/SingletonLock"]);
  const server = await downloadDB.Server.findOne({ where: { Name: { [downloadDB.Op.like]: `${name}%` } } });

  if (server && !downloader) {
    downloader = fork(appPath + "/websocket/Workers/Worker.js");
    downloader.send({ server: server.Id, action: "Check-Server", headless: true, bypass: true });
    downloader.on("exit", () => {
      downloader = null;
    });

    downloader.on("message", (info) => {
      io.sockets.emit("info", info.data);
    });
  }
};
