import { literal, Op } from "sequelize";
import { db } from "../../watch-models/index.js";
import fs from "fs-extra";

export const getWatchedDirs = async (req, res) => {
  const dirs = await db.Directory.findAll({ order: ["Name"] });

  res.send(dirs);
};

export const getWatchFiles = async (req, res) => {
  const { page, items, filter } = req.params;
  const limit = items || 100;
  const offset = (page - 1) * limit;

  const query = {
    order: [[literal(`REPLACE(REPLACE(Name, "-", "0"), '[','0')`)]], // used for natural ordering
    limit,
    offset,
    where: { Path: { [Op.like]: `%${filter || ""}%` } },
  };

  const data = await db.File.findAndCountAll(query);

  res.send({
    files: data.rows,
    totalPages: Math.ceil(data.count / limit),
    totalItems: data.count,
  });
};

export const removeWatchedDir = async ({ params }, res) => {
  if (params.Id) {
    await db.Directory.destroy({ where: { Id: params.Id } });
    return res.send({ valid: true });
  }
  return res.send({ valid: false });
};

export const removeWatchedFile = async ({ params }, res) => {
  if (params.Id) {
    const file = await db.File.findOne({ where: { Id: params.Id } });
    if (file) {
      try {
        fs.removeSync(file.Path);
        await file.destroy();
        return res.send({ valid: true });
      } catch (error) {}
    }
  }
  return res.send({ valid: false });
};

export const renameWatchedFile = async ({ body }, res) => {
  if (body.Id) {
    const file = await db.File.findOne({ where: { Id: body.Id } });
    if (file) {
      try {
        fs.moveSync(file.Path, body.Path);
        await file.update(body);
        return res.send(body);
      } catch (error) {
        console.log(error);
      }
    }
  }
  return res.send({ error: `File: ${body.Name} Already Exist` });
};
