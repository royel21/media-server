module.exports = (server) => {
  const io = require("socket.io")(server);

  io.on("connection", async (socket) => {
    console.log("connected", socket.id);
    socket.on("message", (data) => {
      socket.emit("result", { r: "testing", data });
    });

    socket.on("disconnect", () => {
      console.log("disconnected", socket.id);
    });
  });
};
