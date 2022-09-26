const Router = require("express").Router();
const KeysMap = require("./KeysMap");

const db = require("../../models");

Router.get("/", async (_, res) => {
  const result = await db.user.findAll({ order: ["Name"] });
  // remove password from users
  const users = result.map((u) => ({ ...u.dataValues, Password: "" }));

  return res.send({ users });
});

const validate = async (req, remove) => {
  let { Role, State } = req.body;

  let users = await db.user.findAll();

  let adminsCount = users.filter((a) => a.Role.includes("Administrator")).length === 1;

  let user = users.find((u) => u.Id === req.body.Id);

  const result = { user, isValid: true };
  // we have only one Admin
  if (user.Role.includes("Administrator") && adminsCount) {
    // can't be remove, deactivate or change role
    result.isValid = !(remove || /admin/gi.test(Role) || /Active/gi.test(State));
  }

  return result;
};

const Config = JSON.stringify({
  order: "nu",
  items: 0,
  recentFolders: [],
  video: { KeysMap, volume: 0.3, pause: true, mute: false },
  manga: { KeysMap, scaleX: 0.6, scaleY: 1, aniDuration: 300 },
});

const createUser = async (req) => {
  let { Name } = req.body;
  let user = {
    ...req.body,
    Id: null,
    CreatedAt: new Date(),
    Favorites: [{ Name: "Default" }],
    Recent: { Name },
    UserConfig: { Name, Config },
  };

  let newUser = await db.user.create(user, { encript: true, include: [db.recent, db.favorite, db.userConfig] });

  return {
    user: { ...newUser.dataValues, Password: "" },
    fail: false,
  };
};

const createUpdate = async (req) => {
  let valid = await validate(req);
  let result = { fail: true };

  if (valid.isValid) {
    if (valid.user) {
      let data = { Id: "", ...req.body };
      if (!data.Password) delete data.Password;
      await valid.user.update(data, { encript: true });

      result = { fail: false, user: req.body };
    } else {
      result.msg = `Could't update User ${req.body.Name}, Was not found`;
    }
  } else {
    result.msg = "Can't change Privileges to the only administrator";
  }

  return result;
};

Router.post("/create-update", async (req, res) => {
  const result = await (req.body.Id ? createUpdate(req) : createUser(req));
  return res.send(result);
});

Router.post("/remove", async (req, res) => {
  let valid = await validate(req, true);
  const result = { removed: true };

  if (valid.isValid) {
    if (valid.user) {
      await valid.user.destroy();
    } else {
      result.msg = "User Not Found";
    }
  } else {
    result.msg = "Can't remove the only admin";
  }

  return res.send(result);
});

module.exports = Router;
