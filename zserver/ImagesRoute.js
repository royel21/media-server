const Router = require("express").Router();
const StreamZip = require("node-stream-zip");
const zlib = require("zlib");

Router.get("/:img", async (req, res) => {
  const { img } = req.params;

  const zip = new StreamZip.async({
    file: "./001.zip",
    storeEntries: true,
  });
  const gzip = zlib.createGzip();
  res.writeHead(200, {
    "Content-Encoding": "gzip", // setting the encoding to gzip
  });
  // res.writeHead(200, {
  //   "Content-Type": "image/jpg",
  // });

  const stm = await zip.stream(img);
  stm.pipe(gzip).pipe(res);
  stm.on("end", () => zip.close());
});

module.exports = Router;
