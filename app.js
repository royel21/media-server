const https = require("http");
const express = require("express");
const path = require("path");
// const db = require("./models");
const session = require("express-session");
const passport = require("passport");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(express.static(__dirname + "/client/public"));

app.use(
  session({
    name: "rcm",
    secret: "2491eb2c-595d-4dc8-8427",
    resave: true,
    saveUninitialized: false,
    maxAge: 60000,
  })
);

// app.use(passport.initialize());
// app.use(passport.session());
let auth = false;
app.post("/api/users/login", (req, res) => {
  let { Name, Password } = req.body;
  console.log(req.body);
  auth = true;
  res.send({ Name, Password, isAutenticated: auth });
});

app.get("/api/users/logout", (req, res) => {
  auth = false;
  res.send({ success: true });
});

app.get("/api/users", (req, res) => {
  res.send({ Name: "Royel", isAutenticated: auth });
});

app.get("/*", (req, res) => {
  return res.sendFile(path.join(__dirname + "/client/public/index.html"));
});
const port = 3100;

let server = https
  .createServer(
    // {
    //   key: fs.readFileSync("./cert/server.key"),
    //   cert: fs.readFileSync("./cert/server.cert")
    // },
    app
  )
  .listen(port);
require("./socket-server/socketio-server")(server);
console.log("Node server is running.. at http://localhost:" + port);
