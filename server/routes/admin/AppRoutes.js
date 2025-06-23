import path from "path";
import fs from "fs-extra";
import os from "os";

import { Router } from "express";
import db from "#server/models/index";
import { createDefaultImageDirs } from "#server/utils";

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
      body.RemoveInName = [...new Set(bodyRemoveInName.split(";"))].join(";");
      await data.update(body);
      await data.reload();

      createDefaultImageDirs(data.ImagesPath);

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

routes.get("/genres", async (req, res) => {
  try {
    const tags = await db.Genres.findAll({ order: ["Name"] });

    return res.send(tags);
  } catch (error) {
    console.log(error);
  }
  res.send([]);
});

routes.post("/genres", async (req, res) => {
  const { Genre } = req.body;
  let found = await db.Genres.findOne({ where: { Name: Genre.Name } });
  const data = { Name: Genre.name || Genre.Name, IsRemove: Genre.IsRemove };

  try {
    if (found) {
      await found.update(data);
    } else {
      found = await db.Genres.create(data);
    }
    return res.send({ valid: true, Id: found.Id });
  } catch (error) {
    return res.send({ valid: false, error: error.toString() });
  }
});
routes.post("/genres/remove", async (req, res) => {
  const { Id } = req.body;

  const valid = await db.Genres.destroy({ where: { Id } });
  return res.send({ valid, Id });
});

routes.get("/", async (req, res) => {
  const data = await db.AppConfig.findOne();
  res.send({ config: data.dataValues });
});

export default routes;
