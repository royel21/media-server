const FileManager = require("./file-manager");
const userUpdate = require("./user-update");
const mloader = require("./manga-loader");

const db = require("../models");

module.exports = (server, sessionMeddle) => {
  const io = require("socket.io")(server, { serveClient: false, cookie: true });
  io.use(function (socket, next) {
    sessionMeddle(socket.request, {}, next);
  });

  io.on("connection", async (socket) => {
    let isAuth = socket.request.session.passport;
    if (isAuth) {
      const user = await db.user.findOne({
        where: { Name: isAuth.user },
        include: [{ model: db.userConfig }, { model: db.recent }],
      });
      if (!user) return;
      console.log("connected", socket.id);
      FileManager.setSocket(io, db);
      userUpdate.setDb(db);
      mloader.setDb(db);

      socket.on("scan-dir", FileManager.scanDir);

      if (user.Role.includes("Administrator")) {
        socket.on("load-disks", FileManager.diskLoader);
        socket.on("load-content", FileManager.loadContent);

        socket.on("rename-file", FileManager.renameFile);
        socket.on("remove-file", FileManager.removeFile);

        socket.on("rename-folder", FileManager.renameFolder);
        socket.on("remove-folder", FileManager.removeFolder);
      } else {
        socket.on("file-update-pos", (data) => {
          userUpdate.updateFilePos(data, user);
        });
        socket.on("recent-folder", (data) => {
          userUpdate.recentFolder(data, user);
        });
        socket.on("video-config", (data) => {
          userUpdate.updateConfig(data, user);
        });

        socket.on("loadzip-image", (data) => {
          mloader.loadZipImages(data, socket, user);
        });

        socket.on("message", (data) => console.log("socket", data));
      }

      socket.on("disconnect", () => {
        mloader.removeZip(socket.id);
        console.log("disconnected: ", socket.id);
      });
    }
  });
};
