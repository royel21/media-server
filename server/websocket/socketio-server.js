import FileManager from "./file-manager.js";
import userUpdate from "./user-update.js";
import mloader from "./manga-loader.js";
import { Server } from "socket.io";

import db from "../models/index.js";
import { download } from "./downloader.js";
import { exec } from "node:child_process";

export default async (server, sessionMeddle) => {
  const io = new Server(server, { serveClient: false, cookie: true });
  global.io = io;
  io.use((socket, next) => sessionMeddle(socket.request, {}, next));

  io.on("connection", async (socket) => {
    let isAuth = socket.request.session.passport;
    console.log("connected: ", socket.id);

    if (isAuth) {
      const user = await db.user.findOne({
        where: { Name: isAuth.user },
      });

      if (!user) return;

      FileManager.setSocket(io);

      socket.on("user-info", (data) => console.log(data));

      if (/Administrator|Manager/.test(user.Role)) {
        socket.on("scan-dir", (data) => FileManager.scanDir(data, user));
        socket.on("file-work", (data) => {
          if (data?.action === "removeDBFile") {
            FileManager.fileWork(data);
          }
        });
      }

      socket.on("loadzip-image", (data) => mloader.loadZipImages(data, socket, user.dataValues));

      if (user.Role.includes("Administrator")) {
        socket.on("load-disks", FileManager.diskLoader);

        socket.on("file-work", FileManager.fileWork);
        socket.on("bg-work", FileManager.bgWork);

        socket.on("clean-images", FileManager.cleanImagesDir);
        socket.on("backup-db", FileManager.onBackup);
        socket.on("download-server", download);
        socket.on("update-server", ({ reload }) => {
          socket.emit("rebuild-message", "Rebuilding App - Please Wait");
          exec("yarn build-linux", (err, stdout) => {
            if (err) {
              return;
            }
            socket.emit("rebuild-message", "Finish Building App - Reload");
            if (reload) {
              console.log("reloadig server");
              exec("pm2 restart all");
            }
          });
        });
      } else {
        socket.on("file-update-pos", (data) => userUpdate.updateFilePos(data, user));
        socket.on("recent-folder", (data) => userUpdate.recentFolder(data, user));
        socket.on("reset-recent", (data) => FileManager.resetRecent(data, user));
      }

      socket.on("disconnect", () => console.log("disconnected: ", socket.id));
    } else {
      socket.emit("logout");
    }
  });
};
