import { Router } from "express";
import db from "../../models/index.js";
import user from "../../models/user.js";

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
  let user = {
    ...req.body,
    Id: null,
    CreatedAt: new Date(),
    Favorites: [{ Name: "Default" }],
    SortTabs: [
      {
        Name: "Home",
        SortBy: "dd",
        Items: 0,
      },
      {
        Name: "Videos",
        SortBy: "dd",
        Items: 0,
      },
      {
        Name: "Mangas",
        SortBy: "dd",
        Items: 0,
      },
      {
        Name: "Favorites",
        SortBy: "dd",
        Items: 0,
      },
      {
        Name: "Content",
        SortBy: "dd",
        Items: 0,
      },
    ],
    Hotkeys: [
      { Name: "Open", Key: 37, CtrlKey: true, ShiftKey: false, AltKey: false },
      { Name: "Exit", Key: 77, CtrlKey: true, shiftKey: false, AltKey: false },
      { Name: "Next Tab", Key: 38, CtrlKey: true, ShiftKey: false, AltKey: false },
      { Name: "Prev Tab", Key: 40, CtrlKey: true, ShiftKey: false, AltKey: false },
      { Name: "Continue Reading", Key: 39, CtrlKey: true, ShiftKey: false, AltKey: false },
    ],
  };

  let newUser = await db.user.create(user, { encript: true, include: [db.favorite, db.hotkey, db.sorttab] });

  return {
    user: { ...newUser.dataValues, Password: "" },
    fail: false,
  };
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

export default routes;
