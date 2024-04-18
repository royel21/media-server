import FileManager from "./file-manager.js";
import userUpdate from "./user-update.js";
import mloader from "./manga-loader.js";
import { Server } from "socket.io";

import db from "../models/index.js";
import { download } from "./downloader.js";
import dmDB from "./Models/index.js";
import { exec } from "node:child_process";

export default async (server, sessionMeddle) => {
  await dmDB.init();
  const io = new Server(server, { serveClient: false, cookie: true });
  global.io = io;
  io.use((socket, next) => sessionMeddle(socket.request, {}, next));

  io.on("connection", async (socket) => {
    let isAuth = socket.request.session.passport;

    if (isAuth) {
      const user = await db.user.findOne({
        where: { Name: isAuth.user },
        include: [{ model: db.userConfig }],
      });

      if (!user) return;

      FileManager.setSocket(io);

      socket.on("scan-dir", (data) => FileManager.scanDir(data, user));
      socket.on("user-info", (data) => console.log(data));
      console.log("User: ", user.Name, socket.id);

      if (user.Role.includes("Administrator")) {
        socket.on("load-disks", FileManager.diskLoader);
        socket.on("load-content", FileManager.loadContent);

        socket.on("rename-file", FileManager.renameFile);

        socket.on("rename-folder", FileManager.renameFolder);
        socket.on("remove-folder", FileManager.removeFolder);
        socket.on("clean-images", FileManager.cleanImagesDir);
        socket.on("backup-db", FileManager.onBackup);
        socket.on("download-server", download);
        socket.on("update-server", ({ reload }) => {
          socket.emit("rebuild-message", "Rebuilding App - Please Wait");
          exec("yarn build-linux", (err, stdout) => {
            console.log("build", reload);
            if (err) {
              console.log("error-build", err);
              return;
            }
            if (reload) {
              console.log("reloadig server");
              exec("pm2 restart all");
            }
            console.log(`stdout: ${stdout}`);
            socket.emit("rebuild-message", "Finish Building App - Reload");
          });
        });
      } else {
        socket.on("file-update-pos", (data) => userUpdate.updateFilePos(data, user));
        socket.on("recent-folder", (data) => userUpdate.recentFolder(data, user));
        socket.on("video-config", (data) => userUpdate.updateConfig(data, user));
        socket.on("reset-recent", (data) => FileManager.resetRecent(data, user));
        socket.on("loadzip-image", (data) => mloader.loadZipImages(data, socket, user.dataValues));
      }
      socket.on("remove-file", FileManager.removeFile);

      socket.on("disconnect", () => console.log("disconnected: ", socket.id));
    } else {
      socket.emit("logout");
    }
  });
};
