import { Router } from "express";
import { db } from "../../GameModels/index.js";
import { Op } from "sequelize";
import fs from "fs-extra";
import path from "path";
import os from "os";
import sharp from "sharp";

const homeDir = os.homedir();

const routes = Router();

const getFilters = (splt, filter) => {
  return {
    [splt === "&" ? Op.and : Op.or]: filter.split(splt).map((s) => ({
      [Op.or]: {
        Codes: {
          [Op.like]: "%" + s.trim() + "%",
        },
        Name: {
          [Op.like]: "%" + s.trim() + "%",
        },
        Path: {
          [Op.like]: "%" + s.trim() + "%",
        },
        "$Info.AltName$": {
          [Op.like]: "%" + s.trim() + "%",
        },
        "$Info.Company$": {
          [Op.like]: "%" + s.trim() + "%",
        },
        "$Info.ReleaseDate$": {
          [Op.like]: "%" + s.trim() + "%",
        },
      },
    })),
  };
};

const ListFiles = (dir) => {
  let i = 0;
  let tempFiles = [];
  let foundFiles = fs.readdirSync(dir);

  for (let Name of foundFiles) {
    if (["$"].includes(f[0]) || f.includes("System Volume Information")) continue;

    const Path = path.join(dir, f);

    tempFiles[i] = {
      Name,
      Path,
    };
  }

  return tempFiles;
};

const getCode = (name) => {
  const codeMatch = name.replace(/\.(rar|zip|7z|apk)/g, "").match(/ (v|r|RJ|RA|VO|ST|G|D|IT|VJ)\d+.*\d+$/g);
  return codeMatch ? codeMatch[0].trim() : "";
};

const scanGames = async (dir) => {
  await db.Game.destroy({ where: { DirectoryId: dir.Id } });

  const files = ListFiles(dir.Path);
  let list = [];

  for (const file of files) {
    let Codes = getCode(file.Name);
    const Name = file.Name.replace(Codes, "").trim();

    if (list.find((g) => g.Name === Name && g.DirectoryId === dir.Id)) {
      console.log("dup:", file.Name);
      continue;
    }

    list.push({ Codes, Name, DirectoryId: dir.Id, Path: file.Path });
  }
  const result = await db.Game.bulkCreate(list);
  return result;
};

const getDirectories = async () => {
  let directories = [];
  const sortByName = db.sqlze.literal(`REPLACE(REPLACE(REPLACE(Directories.Name, "@", "#"), "-", "#"), "[","#") ASC`);
  try {
    directories = await db.Directory.findAll({
      attributes: [
        "Id",
        "Name",
        "Path",
        [db.sqlze.literal(`(SELECT COUNT(*) FROM Games WHERE Games.DirectoryId = Directories.Id)`), "Count"],
      ],
      order: [sortByName],
    });
  } catch (error) {
    console.log(error);
  }
  return directories.map((d) => ({
    ...d.dataValues,
    Path: d.Path.replace(homeDir, "homedir"),
  }));
};

routes.get("/directories", async (req, res) => {
  return res.send(await getDirectories());
});

routes.post("/add-directory", async (req, res) => {
  const { Path } = req.body;
  if (!fs.existsSync(Path)) {
    return res.send({ error: "Directory does not exist." });
  }

  const existing = await db.Directory.findOne({ where: { Path } });
  if (existing) {
    return res.send({ errors: "Directory already Added" });
  }

  const name = path.basename(Path);
  let Codes = getCode(name);
  const Name = name.replace(Codes, "").trim();
  const result = await db.Directory.create({ Path, Name });

  await scanGames(result);

  return res.send(await getDirectories());
});

routes.post("/remove-directory", async (req, res) => {
  const { Id } = req.body;

  await db.Directory.destroy({ where: { Id } });

  return res.send({ message: "Directory updated." });
});

routes.post("/reload", async (req, res) => {
  const { Id } = req.body;
  const existing = await db.Directory.findOne({ where: { Id } });

  if (!fs.existsSync(existing.Path)) {
    return res.send({ error: "Directory does not exist." });
  }

  const result = await scanGames(existing);

  return res.send({ count: result.length });
});

routes.post("/update-directory", async (req, res) => {
  const { Path, id } = req.body;

  let p = Path.replace(/^homedir/, homeDir);

  if (!fs.existsSync(p)) {
    return res.send({ message: "Directory does not exist." });
  }

  const dir = await db.Directory.findOne({ where: { Id } });

  await dir.update({ Path: p });

  return res.send({ message: "Directory updated." });
});

routes.post("/update-game-info", async (req, res) => {
  const data = req.body;

  let game = await db.Game.findOne({ where: { Id: data.Id } });

  if (/:|\?|\*|<|>|\/|\\|"/gi.test(data.Name)) {
    data.Name = data.Name.replace("/", " ")
      .replace("*", "x")
      .replace(/\/|\\/g, " ")
      .replace(/:|\?|<|>|"/g, "");
  }

  if (data.Path !== game.Path && !fs.existsSync(data.Path)) {
    return res.send({ error: "Game Path does not exist." });
  }

  if (!data.Codes) {
    data.Codes = getCode(data.Name) || getCode(game.Name);
  }

  game.Codes = data.Codes;

  const info = {
    Codes: data.Codes,
    AltName: data.AltName?.trim(),
    Company: data.Company?.trim(),
    ReleaseDate: data.ReleaseDate,
    Description: data.Description?.trim(),
  };

  game.Info = await db.Info.findOne({ where: { Codes: info.Codes } });

  if (info.Codes === "") {
    if (game.Info == null) {
      game.Info = await db.Info.create(info);
    } else {
      await game.Info?.update(info);
    }
  }

  if (game.Name !== data.Name) {
    game.Name = data.Name.replace(data.Codes, "")
      .replace(/\.(zip|rar|7z|apk)$/, "")
      .trim();

    const basePath = path.dirname(game.Path);

    let ex = "";
    if (/\.[a-z0-9]{3,4}$/i.test(ex)) {
      ex = game.Path.split(/\.[a-z0-9]{3,4}/i).pop();
    }

    data.Path = path
      .join(basePath, game.Name + " " + data.Codes + ex)
      .replace(/( )+/g, " ")
      .trim();

    try {
      fs.renameSync(game.Path, data.Path);
    } catch (error) {
      console.log(error);
    }
  }

  game.Path = data.Path;

  if (imageBuffer) {
    const imgPath = path.join(path.dirname(game.Path), "Cover.jpg");
    await sharp(imageBuffer).resize(300).jpeg().toFile(imgPath);
  }

  await game.save();
  await game.reload();
  return res.send({ ...game.dataValues, ...info });
});

routes.post("/upload-game-image", async (req, res) => {
  const { Id } = req.body;
  let game = await db.Game.findOne({ where: { Id } });

  let imageBuffer;
  if (req.files.file) {
    imageBuffer = Buffer.from(req.files.file.data);
  }

  if (imageBuffer) {
    const imgPath = path.join(game.Path, "Cover.jpg");
    console.log("image-save", imgPath);
    await sharp(imageBuffer).resize(300).jpeg().toFile(imgPath);
  }

  return res.send({ msg: "Image uploaded." });
});

routes.post("/get-game-image", async (req, res) => {
  const { Id } = req.body;
  let game = await db.Game.findOne({ where: { Id } });
  let imgPath = path.join(game.Path, "Cover.jpg");
  console.log(imgPath);
  let image = "";
  if (fs.existsSync(imgPath)) {
    image = fs.readFileSync(imgPath, { encoding: "base64" });
  }
  return res.send({ image });
});

routes.get("/:page/:rows/:search?", async (req, res) => {
  const { page = 0, rows, search = "" } = req.params;

  const offset = (page - 1) * +rows;
  let filters = getFilters(search.includes("&") ? "&" : "|", search);

  const sortByName = db.sqlze.literal(`REPLACE(REPLACE(REPLACE(Games.Name, "@", "#"), "-", "#"), "[","#") ASC`);

  let games = [];
  try {
    games = await db.Game.findAndCountAll({
      where: filters,
      order: [sortByName],
      offset,
      limit: rows,
      include: [
        {
          model: db.Info,
          required: false,
          on: {
            "$Games.Codes$": { [db.Op.eq]: db.sqlze.col("Info.Codes") },
          },
        },
      ],
    });
  } catch (error) {
    console.log(error);
  }

  return res.send({
    items: games.rows.map((g) => ({
      ...g.dataValues,
      Path: g.Path.replace(homeDir, "homedir"),
    })),
    totalItems: games.count,
    totalPages: Math.ceil(games.count / rows),
  });
});

export default routes;
