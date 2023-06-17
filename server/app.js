import express from "express";
import path from "path";
import session from "express-session";
import cookieParser from "cookie-parser";
import cors from "cors";
import { config } from "dotenv";
import compression from "compression";

import passportConfig from "./passport.js";
import websocketConfig from "./websocket/socketio-server.js";
import { fileURLToPath } from "url";

config();

import db from "./models/index.js";

const __filename = fileURLToPath(import.meta.url);
global.appPath = path.dirname(__filename);

import userRoutes from "./routes/UserRoutes.js";
import filesRoutes from "./routes/FilesRoutes.js";
import favoriteRoutes from "./routes/FavoriteRoutes.js";
import ViewerRoutes from "./routes/ViewerRoutes.js";
import UsersManagerRoute from "./routes/admin/UsersManagerRoute.js";
import DirectoriesRoute from "./routes/admin/DirectoriesRoute.js";
import FilesManagerRoute from "./routes/admin/FilesManagerRoute.js";
import FoldersRoute from "./routes/admin/FoldersRoute.js";

const app = express();
const passport = passportConfig();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(
  compression({
    filter: function (req, res) {
      return !req.url.includes("viewer/video");
    },
  })
);

app.use(express.static(process.env.IMAGES));
app.use(express.static(global.appPath + "/public/static", { dotfiles: "allow" }));

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

app.use((req, res, next) => (req.user ? next() : res.redirect("/login")));

app.use("/api/files/favorites", favoriteRoutes);
app.use("/api/files", filesRoutes);
app.use("/api/viewer", ViewerRoutes);

app.use("/api/admin", ({ user }, res, next) =>
  user.Role.includes("Administrator") ? next() : res.redirect("/notfound")
);

app.use("/api/admin/users", UsersManagerRoute);
app.use("/api/admin/directories", DirectoriesRoute);
app.use("/api/admin/files", FilesManagerRoute);
app.use("/api/admin/folders", FoldersRoute);

const getPath = (type) => path.join(global.appPath, "public", type, "index.html");

// process login page request
app.get("/login/*", (_, res) => res.sendFile(getPath("/static/login")));

app.get("/admin/*", ({ user }, res) =>
  user.Role.includes("User") ? res.redirect("/user") : res.sendFile(getPath("admin"))
);

app.get("/*", ({ user }, res) =>
  user.Role.includes("Admin") ? res.redirect("/admin/") : res.sendFile(getPath("user"))
);

app.use((e, _, res, __) => {
  if (e.message.includes("Failed to decode param")) {
    return res.redirect("/notfound");
  }
});

const { PORT, PORT2, IP, HOME_IP, IP_LOCAL, USE_LOCAL } = process.env;
let host = USE_LOCAL ? IP_LOCAL : process.env.USERNAME === "rconsoro" ? IP : HOME_IP;
const port = process.env.USERNAME === "rconsoro" ? PORT2 : PORT;

console.log(process.env.NODE_ENV, host, port);

db.init().then(() => {
  websocketConfig(app.listen(port, host), sessionMeddle);
  console.log(`Node server is running.. at http://${host}:${port}`);
});
