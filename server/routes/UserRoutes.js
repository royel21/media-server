const Router = require("express").Router();

const passport = require("passport");
const sendUser = (res, user = { UserConfig: { dataValues: {} } }) => {
  return res.json({
    Id: user.Id,
    role: user.Role || "",
    username: user.Name || "",
    isAutenticated: user !== undefined,
    favorites: user.Favorites || [],
    Config: JSON.parse(user.UserConfig.dataValues.Config),
  });
};

Router.post("/login", (req, res, next) => {
  return passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);

    if (user) {
      return req.logIn(user, (err) => {
        if (err) return next(err);
        return sendUser(res, user);
      });
    } else {
      return res.json({ isAutenticated: false, info });
    }
  })(req, res, next);
});

Router.get("/logout", (req, res) => {
  req.session.destroy();
  return res.send({ success: true });
});

Router.get("/userconfig", (req, res) => {
  if (!req.user) return res.send({});
  let config = req.user.UserConfig.Config;
  return res.send(JSON.parse(config));
});

Router.get("/", (req, res) => {
  if (!req.user) return res.send({});
  sendUser(res, req.user);
});

module.exports = Router;
