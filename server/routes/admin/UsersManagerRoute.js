import { Router } from "express";
import db from "../../models/index.js";
import { defHotkeys, defSortTabs } from "../../defaultHotkeys.js";
import defaultConfig from "../../default-config.js";

const routes = Router();

routes.get("/", async (_, res) => {
  const result = await db.user.findAll({ order: ["Name"] });
  // remove password from users
  const users = result.map((u) => ({ ...u.dataValues, Password: "" }));

  return res.send({ users });
});

const getUser = async (req) => {
  let users = await db.user.findAll();

  let user = users.find((u) => u.Id === req.body.Id);

  return { user, admins: users.filter((a) => /^Adm/i.test(a.Role)).length > 1 };
};

const createUser = async (req) => {
  const config = await db.AppConfig.findOne();
  const Password = req.body.Role === "Administrator" ? config.AdminPassword : config.UserPassword;

  let user = {
    ...req.body,
    Id: null,
    CreatedAt: new Date(),
    Favorites: [{ Name: "Default" }],
    SortTabs: defSortTabs,
    Hotkeys: defHotkeys,
    Password,
  };

  try {
    let newUser = await db.user.create(user, { encript: true, include: [db.favorite, db.hotkey, db.sorttab] });

    return {
      user: { ...newUser.dataValues, Password: "" },
      fail: false,
    };
  } catch (error) {
    return {
      fail: true,
      msg: "User Name Must Be Unique",
    };
  }
};

const updateUser = async (req) => {
  const { Id, State, Role, Password } = req.body;
  let valid = await getUser(req);

  if (req.user.Id === Id && (/inactive/i.test(State) || !/^Admin/i.test(Role))) {
    return { msg: "Can't Change Status or Role Current for Administrator", fail: true };
  }

  if (!valid.user) {
    return { msg: "User Not Found", fail: true };
  }

  if (!Password) delete req.body.Password;

  await valid.user.update(req.body, { encript: Password });
  return { fail: false, user: req.body };
};

routes.post("/create-update", async (req, res) => {
  const result = await (req.body.Id ? updateUser(req) : createUser(req));
  return res.send(result);
});

routes.post("/reset-pass", async (req, res) => {
  const config = await db.AppConfig.findOne();
  const isAdmin = req.user.Role;

  if (!isAdmin) {
    return { error: ["User Not Auothoried"] };
  }

  const user = await db.user.findOne({ where: { Id: req.body.Id } });
  if (user) {
    const { Role } = user.dataValues;

    const Password = /Admin|Manager/i.test(Role) ? config.AdminPassword : config.UserPassword;
    await user.update({ Id: req.body.Id, Password, LoginCount: 0 }, { encript: Password });
  }

  return res.send({ valid: true });
});

routes.post("/remove", async (req, res) => {
  let valid = await getUser(req);

  if (valid.user === undefined) {
    return res.send({ msg: "User Not Found", removed: false });
  }

  if (req.user.Id === valid.user.Id) {
    return res.send({ msg: "Can't Remove Current Admin", removed: false });
  }

  await valid.user.destroy();
  return res.send({ removed: true });
});

routes.post("/update-hotkeys", async ({ body }, res) => {
  for (const key of body.keys || []) {
    const found = await db.hotkey.findOne({ where: { Id: key.Id } });
    if (found) found.update(key);
  }

  return res.send([]);
});

routes.get("/user/:Id", async ({ params }, res) => {
  if (params.Id) {
    const user = await db.user.findOne({ where: { Id: params.Id }, include: [db.sorttab, db.hotkey] });
    return res.send(user.Hotkeys);
  }

  return res.send([]);
});

routes.get("/user-cfg-def", (_, res) => {
  return { defHotkeys, defSortTabs };
});

export default routes;
