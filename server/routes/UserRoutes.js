import { Router } from "express";

import passport from "passport";
import db from "../models/index.js";
import { defSortTabs, defHotkeys } from "../defaultHotkeys.js";

const routes = Router();

const sendUser = async (res, user = { UserConfig: { dataValues: {} } }) => {
  return res.json({
    Id: user.Id,
    role: user.Role || "",
    username: user.Name || "",
    isAutenticated: user !== undefined,
    favorites: user.Favorites || [],
    hotkeys: user.Hotkeys,
    sortTabs: user.SortTabs,
  });
};

routes.post("/login", (req, res, next) => {
  return passport.authenticate("local", async (err, user, info) => {
    if (err) return next(err);

    if (user) {
      const { newpassword } = req.body;
      if (newpassword && /(?=.*\d)(?=.*[a-z])(?=.*[A-Z])/.test(newpassword)) {
        user.update({ Password: newpassword }, { encript: newpassword });
      }
      req.logIn(user, (err) => {
        if (err) return next(err);
        return sendUser(res, user);
      });
    } else {
      res.json({ isAutenticated: false, info });
    }
  })(req, res, next);
});

routes.get("/logout", (req, res) => {
  req.session.destroy();
  return res.send({ success: true });
});

routes.get("/userconfig", (req, res) => {
  if (!req.user) return res.send({});
  return res.send("no found");
});

routes.post("/update-hotkeys", async (req, res) => {
  const { body } = req;
  for (const key of body.hotkeys) {
    await db.hotkey.update(key, { where: { Id: key.Id, UserId: key.UserId } });
  }

  return res.send({ valid: true });
});

routes.post("/update-sorttabs", async (req, res) => {
  const { body } = req;
  for (const tab of body.sorttab) {
    await db.sorttab.update(tab, { where: { Id: tab.Id, UserId: tab.UserId } });
  }

  return res.send({ valid: true });
});

routes.get("/", (req, res) => {
  if (!req.user) return res.send({});
  sendUser(res, req.user);
});

export default routes;
