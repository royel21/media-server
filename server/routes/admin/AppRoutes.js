import { Router } from "express";
import db from "../../models/index.js";
import { createDefaultImageDirs } from "../../utils.js";

const routes = Router();

routes.post("/save", async (req, res) => {
  const data = await db.AppConfig.findOne();

  if (data) {
    try {
      createDefaultImageDirs(req.body.CoverPath);
      await data.update(req.body);
      return res.send({ valid: true });
    } catch (error) {
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
