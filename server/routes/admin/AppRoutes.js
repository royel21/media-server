import path from "path";
import fs from "fs-extra";
import os from "os";

import { Router } from "express";
import db from "../../models/index.js";
import { createDefaultImageDirs } from "../../utils.js";

const routes = Router();
const Names = ["Mangas", "Webtoons"];
const AdultNames = [...Names, "Mangas Raw", "Webtoons Raw"];

const createDirs = async (BasePath, names, IsAdult = false) => {
  const adultDirs = await db.directory.findAll({ where: { Name: names, IsAdult } });

  for (let Name of names) {
    const FullPath = IsAdult ? path.join(BasePath, "R18", Name) : path.join(BasePath, Name);

    if (!fs.existsSync(FullPath)) {
      fs.mkdirpSync(FullPath);
    }

    if (!adultDirs.find((d) => d.FullPath === FullPath)) {
      await db.directory.create({ Name, FullPath, IsAdult, Type: "Mangas" });
    }
  }
};

routes.post("/save", async (req, res) => {
  const data = await db.AppConfig.findOne();
  const body = req.body;

  if (data) {
    try {
      createDefaultImageDirs(req.body.CoverPath.replace("homedir", os.homedir()));

      await data.update(body);
      await createDirs(body.MangaPath.replace("homedir", os.homedir()), Names);
      await createDirs(body.AdultPath.replace("homedir", os.homedir()), AdultNames, true);

      return res.send({ valid: true });
    } catch (error) {
      console.log(error);
      return res.send({ error: error.toString() });
    }
  }

  return res.send({ error: "Config Not Found" });
});

routes.get("/", async (req, res) => {
  const data = await db.AppConfig.findOne();
  res.send({ config: data });
});

export default routes;
