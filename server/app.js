import express from "express";
import path from "path";
import session from "express-session";
import cookieParser from "cookie-parser";
import cors from "cors";
import { config } from "dotenv";
import compression from "compression";
import fileUpload from "express-fileupload";

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
import DownloaderRoutes from "./routes/admin/DownloaderRoutes.js";
import defaultConfig from "./default-config.js";
import AppRoutes from "./routes/admin/AppRoutes.js";

const app = express();
const passport = passportConfig();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false, limit: "50mb" }));
app.use(cookieParser());
app.use(fileUpload({ limits: { fileSize: 400 * 1024 * 1024 } }));

app.use(
  compression({
    filter: function (req) {
      return !req.url.includes("viewer/video");
    },
  })
);

app.use(express.static(defaultConfig.ImagesDir));
app.use(express.static(path.join(appPath, "public", "static"), { dotfiles: "allow" }));

const sessionMeddle = session({
  name: defaultConfig.sessionName,
  secret: defaultConfig.sessionSecret,
  resave: false,
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

app.use("/api/admin", ({ user, url }, res, next) => {
  console.log(url);
  return user.Role.includes("Administrator") ? next() : res.redirect("/notfound");
});

app.use("/api/admin/users", UsersManagerRoute);
app.use("/api/admin/directories", DirectoriesRoute);
app.use("/api/admin/files", FilesManagerRoute);
app.use("/api/admin/folders", FoldersRoute);
app.use("/api/admin/downloader", DownloaderRoutes);
app.use("/api/admin/app-config", AppRoutes);

const getPath = (type) => path.join(path.dirname(__filename), "public", type, "index.html");

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

const iniServer = async () => {
  try {
    // await createdb();
    console.log("Initialize database");
    await db.init();
  } catch (error) {
    console.log(error);
    if (/Unknown database/.test(error.toString())) {
      console.log(`Database ${defaultConfig.dbNameg} no found or don't have access`);
      console.log(`Please create dabase ${defaultConfig.dbNameg} and give access to the app`);
    }
    console.log("Server shutdown");
    return process.exit();
  }

  console.log("Initialize Server");
  websocketConfig(app.listen(defaultConfig.port, defaultConfig.host), sessionMeddle);
  console.log(`Server is running.. at http://${defaultConfig.host}:${defaultConfig.port}`);
};

iniServer().catch((err) => console.log(err));
