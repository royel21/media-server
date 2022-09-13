const https = require("http");
const express = require("express");
const path = require("path");
const compression = require("compression");

const app = express({
  filter: function () {
    return true;
  },
});

app.use(compression());

const imagesRoute = require("./ImagesRoute");

app.use("/img", imagesRoute);

app.get("/*", (_, res) => {
  return res.sendFile(path.join(__dirname + "/index.html"));
});

https.createServer(app).listen(8081, "localhost");

console.log(`Node server is running.. at http://localhost:8081`);
