import { Router } from "express";
import { db } from "../../GameModels/index.js";
import { Op } from "sequelize";
import fs from "fs-extra";
import path from "path";
import os from "os";
import sharp from "sharp";
import { clamp } from "../utils.js";

const homeDir = os.homedir();

const imgDir = path.join(homeDir, "images", "games");

if (!fs.existsSync(imgDir)) {
  fs.mkdirsSync(imgDir);
}

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
        "$Info.Lang$": {
          [Op.like]: "%" + s.trim() + "%",
        },
      },
    })),
  };
};

const ListFiles = (dir) => {
  const fileInfo = (dir, f) => {
    let data = fs.statSync(dir);
    return {
      isDirectory: data.isDirectory(),
      Name: f,
      Size: data.size,
      isHidden: f[0] == ".",
      Extension: !data.isDirectory() ? f.split(".").pop() : "",
      LastModified: data.mtime,
      Path: dir,
    };
  };

  let foundFiles = fs.readdirSync(dir);
  let tempFiles = [];
  let i = 0;
  for (let f of foundFiles) {
    if (["$"].includes(f[0]) || f.includes("System Volume Information")) continue;
    const file = path.join(dir, f);
    try {
      tempFiles[i] = fileInfo(file, f);
      i++;
    } catch (error) {
      console.log("error oppening file", file);
    }
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
  const dubs = [];

  for (const file of files) {
    let Codes = getCode(file.Name);
    const Name = file.Name.replace(" " + Codes, "").trim();

    if (list.find((g) => g.Name === Name)) {
      dubs.push(file.Name);
    }

    const found = await db.Game.findOne({ where: { Codes, Name } });

    if (found && !found.Path) {
      found.Path = file.Path;
      found.DirectoryId = dir.Id;
      try {
        await found.save();
      } catch (error) {}
    } else {
      list.push({ Codes, Name, DirectoryId: dir.Id, Path: file.Path });
    }
  }
  const games = await db.Game.bulkCreate(list);
  return { games, dubs };
};

const getDirectories = async () => {
  let directories = [];
  const sortByName = db.sqlze.literal(`REPLACE(REPLACE(REPLACE(Directories.Path, "@", "#"), "-", "#"), "[","#") ASC`);
  try {
    directories = await db.Directory.findAll({
      attributes: [
        "Id",
        "Name",
        "Path",
        [db.sqlze.literal(`(SELECT COUNT(*) FROM Games WHERE Games.DirectoryId = Directories.Id)`), "Count"],
      ],
      order: [sortByName, ["Name", "ASC"]],
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

  const { dubs } = await scanGames(result);

  return res.send({ dirs: await getDirectories(), dubs });
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

  return res.send({ count: result.games.length, dubs: result.dubs });
});

routes.post("/update-directory", async (req, res) => {
  const { Path, id } = req.body;

  let p = Path.replace(/^homedir/, homeDir);

  if (!fs.existsSync(p)) {
    return res.send({ message: "Directory does not exist." });
  }

  const dir = await db.Directory.findOne({ where: { Id: id } });

  await dir.update({ Path: p });

  await db.Game.update(
    { Path: db.sqlze.literal(`REPLACE(Path, ${dir.Path}, ${Path})`) },
    { where: { DirectoryId: dir.Id } },
  );

  return res.send({ message: "Directory updated." });
});

const createGame = async (data, res) => {
  const game = await db.Game.create({
    Name: data.Name.trim(),
    Codes: data.Codes.trim(),
    Path: data.Path?.trim() || "",
  });
  const info = {
    Codes: data.Codes,
    AltName: data.AltName?.trim(),
    Company: data.Company?.trim(),
    Lang: data.Lang?.trim() || "Japanese",
    Description: data.Description?.trim(),
  };
  game.Info = await db.Info.create(info);

  res.send({ ...game.dataValues, ...info });
};

const extRegx = /\.([a-z0-9]{2,4})$/i;

routes.post("/update-game-info", async (req, res) => {
  const data = req.body;

  let game = {};

  if (data.Id === "new") {
    const found = await db.Game.findOne({ where: { Codes: data.Codes } });
    if (found) {
      return res.send({ error: "Game Exist: " + data.Codes });
    }

    delete data.Id;
    return await createGame(data, res);
  } else {
    game = await db.Game.findOne({ where: { Id: data.Id } });
  }

  //Clean Name
  if (/:|\?|\*|<|>|\/|\\|"/gi.test(data.Name)) {
    data.Name = data.Name.replace("/", " ")
      .replace("*", "x")
      .replace(/\/|\\/g, " ")
      .replace(/:|\?|<|>|"/g, "");
  }

  if (!data.Codes) {
    data.Codes = (getCode(data.Name) || getCode(game.Name)).tim();
  }

  const info = {
    Codes: data.Codes,
    AltName: data.AltName?.trim(),
    Company: data.Company?.trim(),
    Lang: data.Lang?.trim() || "Japanese",
    Description: data.Description?.trim(),
  };

  game.Info = await db.Info.findOne({ where: { Codes: info.Codes } });

  if (info.Codes) {
    if (game.Info === null) {
      game.Info = await db.Info.create(info);
    } else {
      await game.Info?.update(info);
    }
  }

  if (game.Codes !== data.Codes) {
    const oldImg = path.join(imgDir, `${game.Codes}.jpg`);
    if (fs.existsSync(oldImg)) {
      fs.moveSync(oldImg, path.join(imgDir, `${data.Codes}.jpg`));
    }
  }

  if (game.Path && (game.Name !== data.Name || game.Codes !== data.Codes)) {
    const basePath = path.dirname(game.Path);
    let ex = game.Path.match(extRegx) || "";

    if (ex) ex = ex[0];

    data.Path = path.join(basePath, `${data.Name.replace(ex, "")} ${data.Codes}${ex}`).replace(/( )+/g, " ");

    if (fs.existsSync(game.Path)) {
      try {
        fs.renameSync(game.Path, data.Path);
        game.Path = data.Path;

        if (game.Name !== data.Name) {
          game.Name = data.Name.replace(data.Codes, "").replace(extRegx, "").trim();
        }
        game.Codes = data.Codes;
      } catch (error) {
        console.log(error);
        return res.send({ error: "Game Path does not exist." });
      }
    }
  }

  try {
    await game.save();
    await game.reload();
  } catch (error) {
    console.log(error);
  }

  return res.send({ ...game.dataValues, ...info });
});

routes.post("/upload-game-image", async (req, res) => {
  const { Id } = req.body;
  let game = await db.Game.findOne({ where: { Id } });

  if (!game?.Codes) {
    return res.send({ error: "Game Have No Codes to save image" });
  }

  let imageBuffer;
  if (req.files.file) {
    imageBuffer = Buffer.from(req.files.file.data);
  }

  if (imageBuffer && game?.Codes) {
    const imgPath = path.join(imgDir, `${game.Codes}.jpg`);
    await sharp(imageBuffer).resize(300).jpeg().toFile(imgPath);
  }

  return res.send({ msg: "Image uploaded." });
});

routes.post("/get-game-image", async (req, res) => {
  const { Id } = req.body;
  let image = "";
  if (Id) {
    let game = await db.Game.findOne({ where: { Id } });
    if (game) {
      let imgPath = path.join(imgDir, `${game.Codes}.jpg`);
      if (fs.existsSync(imgPath)) {
        image = fs.readFileSync(imgPath, { encoding: "base64" });
      }
    }
  }
  return res.send({ image });
});

const getGames = async (res, page, rows, search) => {
  let filters = getFilters(search.includes("&") ? "&" : "|", search);

  const sortByName = db.sqlze.literal(`REPLACE(REPLACE(REPLACE(Games.Name, "@", "#"), "-", "#"), "[","#") ASC`);

  let games = [];
  try {
    const query = {
      where: filters,
      order: [sortByName],
      include: [
        {
          model: db.Info,
          required: false,
          on: {
            "$Games.Codes$": { [db.Op.eq]: db.sqlze.col("Info.Codes") },
          },
        },
      ],
    };

    const count = await db.Game.count(query);

    const totalPages = Math.ceil(count / rows);
    page = clamp(page, 1, totalPages);

    query.offset = (page - 1) * +rows;
    query.limit = +rows;

    games = await db.Game.findAndCountAll(query);

    return res.send({
      items: games.rows.map((g) => ({
        ...g.dataValues,
        Path: g.Path.replace(homeDir, "homedir"),
      })),
      page,
      totalItems: count,
      totalPages: Math.ceil(count / rows),
    });
  } catch (error) {
    console.log(error);
  }

  return {
    items: [],
    page: 1,
    totalPages: 0,
    totalItems: 0,
  };
};

routes.post("/remove-game", async (req, res) => {
  const { Id, page, filter, rows } = req.body;
  let game = await db.Game.findOne({ where: { Id } });
  await game.destroy();

  return await getGames(res, page, rows, filter || "");
});

routes.get("/:page/:rows/:search?", async (req, res) => {
  const { page = 0, rows, search = "" } = req.params;

  return await getGames(res, page, rows, search);
});

export default routes;
