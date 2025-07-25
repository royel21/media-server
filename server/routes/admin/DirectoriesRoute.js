import { Router } from "express";
import db from "#server/models/index";

import fs from "fs-extra";
import path from "path";
import { ListFiles } from "win-explorer";
import { literal } from "sequelize";
import os from "node:os";
import { streaming } from "../ViewerRoutes.js";

const getNewId = () => {
  return Math.random().toString(36).slice(-5);
};

const routes = Router();

routes.post("/remove", (req, res) => {
  let { Id } = req.body;
  db.directory
    .destroy({ where: { Id } })
    .then((result) => {
      if (result > 0) {
        res.send({ removed: true });
      } else {
        res.send({ removed: false, msg: "Can't find folder by Id" });
      }
    })
    .catch((err) => {
      console.log(err);
      res.send({ removed: false, msg: "Server error 500" });
    });
});

const homeDir = os.homedir();

routes.post("/content", (req, res) => {
  try {
    let { Id, Path } = req.body;

    const nativePath = Path.replace("homedir", homeDir);

    if (fs.existsSync(nativePath)) {
      let dirs = ListFiles(nativePath, { hidden: true });
      let tdata = [];
      for (let d of dirs) {
        if (d.Name === "lost+found") continue;

        if (d.isDirectory || !/^\./.test(d.Extension)) {
          tdata.push({
            Id: getNewId(),
            Name: d.Name,
            Path: path.join(Path, d.Name),
            Content: [],
            Type: d.isDirectory ? "folder" : "file",
            Size: d.Size,
            LastModified: d.LastModified,
            isHidden: d.isHidden,
          });
        }
      }
      res.send({ data: tdata, Id });
    }
  } catch (error) {
    console.log(error);
    res.send({ data: [], Id });
  }
});

routes.post("/remove-file", async (req, res) => {
  const { body } = req;
  try {
    fs.removeSync(body.Path.replace("homedir", homeDir));
    res.send({ success: true });
  } catch (error) {
    res.send({ success: false });
  }
});

routes.post("/update", async (req, res) => {
  const { body } = req;
  const dir = await db.directory.findOne({ where: { Id: body.id } });
  let success = false;
  let error;
  if (dir) {
    try {
      if (body.FullPath) {
        if (!fs.existsSync(body.FullPath.replace("homedir", homeDir))) {
          return res.send({ error: `Directory ${body.FullPath} don't exist` });
        }

        await db.sqlze.query(`Update Folders set Path=REPLACE(Path, ?, ?) WHERE DirectoryId='${dir.Id}'`, {
          replacements: [dir.FullPath, body.FullPath],
        });
      }
      await dir.update(body);
    } catch (err) {
      error = `Path Can't be duplicate`;
      console.log(err);
    }
  }
  res.send({ success, error });
});

routes.post("/get-dirs", (req, res) => {
  let { dir, next, back } = req.body;
  let Path = dir || "";

  if (Path.includes("homedir")) {
    dir = Path.replace("homedir", homeDir);
    Path = dir;
  }

  if (next && Path) Path = path.join(Path, next);

  const backPath = path.dirname(Path);
  if (back) {
    Path = backPath;
  }

  if (/^(\/|\/home(\/|)|c\:(\\|\/)users(\\|\/|))(\.|)$/i.test(backPath)) {
    Path = dir;
  }

  if (fs.existsSync(Path)) {
    const dirs = ListFiles(Path)
      .filter((d) => d.isDirectory)
      .map((d) => d.Name);

    if (Path.includes(homeDir)) {
      Path = Path.replace(homeDir, "homedir");
    }

    return res.send({ dirs, Path });
  }

  return res.send({ Path, dirs: [] });
});

routes.post("/create-path", async (req, res) => {
  let { Path, NewFolder } = req.body;

  if (NewFolder) {
    Path = path.join(Path.replace("homedir", homeDir), NewFolder);
    fs.mkdirpSync(Path);
  }

  return res.send({ Path });
});

routes.get("/video/:path?", async (req, res) => {
  let { path } = req.params;
  if (path && fs.existsSync(path)) {
    path = path.replace("homedir", homeDir);
    streaming({ Path: path }, req, res);
  } else {
    res.send("Error File Not Found");
  }
});

routes.get("/", async (req, res) => {
  const data = await db.directory.findAll({
    attributes: {
      include: [
        [literal("IFNULL((Select COUNT(Folders.Id) from Folders where DirectoryId = Directory.Id), 0)"), "FolderCount"],
        [literal("IFNULL((Select SUM(FileCount) from Folders where DirectoryId = Directory.Id), 0)"), "TotalFiles"],
      ],
    },
    order: ["Type", "IsAdult", "FullPath"],
  });

  let dirs = data.map((d) => d.dataValues);
  res.send(dirs);
});

export default routes;
