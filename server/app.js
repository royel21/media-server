const https = require("http");
const express = require("express");
const path = require("path");
const session = require("express-session");
const passport = require("passport");
const cookieParser = require("cookie-parser");
const cors = require("cors");

require("dotenv").config();
const db = require("./models");
require("./passport")(passport);

global.appPath = __dirname;

const userRoutes = require("./routes/UserRoutes");
const filesRoutes = require("./routes/FilesRoutes");
const favoriteRoutes = require("./routes/FavoriteRoutes");
const ViewerRoutes = require("./routes/ViewerRoutes");

// Administrator
const UsersManagerRoute = require("./routes/admin/UsersManagerRoute");
const DirectoriesRoute = require("./routes/admin/DirectoriesRoute");
const FilesManagerRoute = require("./routes/admin/FilesManagerRoute");
const FoldersRoute = require("./routes/admin/FoldersRoute");
const compression = require("compression");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(compression());

app.use(express.static(process.env.IMAGES));
app.use(express.static(__dirname + "/public"));

const sessionMeddle = session({
  name: process.env.SESSION,
  secret: "2491eb2c-595d-4dc8-8427",
  resave: true,
  saveUninitialized: false,
  maxAge: 24 * 60 * 60 * 1000 * 30,
});
app.use(sessionMeddle);

app.use(passport.initialize());
app.use(passport.session());

// it is here because is needed for login before access the other routes;
app.use("/api/users", userRoutes);

app.use((req, res, next) => {
  if (!/login|api\/users\/login/gi.test(req.url) && !req.user) {
    return res.redirect("/login");
  }
  return next();
});

app.use("/api/files/favorites", favoriteRoutes);
app.use("/api/files", filesRoutes);
app.use("/api/viewer", ViewerRoutes);

app.use("/api/admin", (req, res, next) => {
  if (!req.user.Role.includes("Administrator")) {
    return res.redirect("/notfound");
  }
  next();
});

app.use("/api/admin/users", UsersManagerRoute);
app.use("/api/admin/directories", DirectoriesRoute);
app.use("/api/admin/files", FilesManagerRoute);
app.use("/api/admin/folders", FoldersRoute);

app.get("/*", (_, res) => {
  return res.sendFile(path.join(__dirname + "/public/index.html"));
});

app.use((e, _, res, __) => {
  if (e.message.includes("Failed to decode param")) {
    return res.redirect("/notfound");
  }
});
const { PORT, PORT2, IP, HOME_IP } = process.env;
const host = process.env.USERNAME === "rconsoro" ? IP : HOME_IP;
const port = process.env.USERNAME === "rconsoro" ? PORT2 : PORT;

db.init().then(() => {
  let server = https
    .createServer(
      // {
      //   key: fs.readFileSync("./cert/server.key"),
      //   cert: fs.readFileSync("./cert/server.cert")
      // },
      app
    )
    .listen(port, host);

  console.log(`Node server is running.. at http://${host}:${port}`);

  return require("./websocket/socketio-server")(server, sessionMeddle);
});

console.log(process.env.NODE_ENV, port);
