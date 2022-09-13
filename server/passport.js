let LocalStrategy = require("passport-local").Strategy;
let db = require("./models");

module.exports = (passport) => {
  passport.serializeUser((user, done) => done(null, user.Name));

  passport.deserializeUser(async (username, done) => {
    const user = await db.user.findOne({
      order: [db.sqlze.literal("LOWER(Favorites.Name)")],
      where: {
        Name: username,
      },
      include: [{ model: db.userConfig }, { model: db.recent }, { model: db.favorite, attributes: ["Id", "Name"] }],
    });

    if (user) {
      done(null, user);
    } else {
      done(null, false, {
        type: "user",
        message: `${username} is no authorized`,
      });
    }
  });

  passport.use(
    new LocalStrategy({ usernameField: "username", passwordField: "password" }, async (username, password, done) => {
      const user = await db.user.findOne({
        order: [db.sqlze.literal("LOWER(Favorites.Name)")],
        where: {
          Name: username,
        },
        include: [{ model: db.userConfig }, { model: db.recent }, { model: db.favorite, attributes: ["Id", "Name"] }],
      });
      const isValid = await user.validPassword(password);
      if (isValid) {
        done(null, user);
      } else {
        done(null, false, {
          type: "user",
          message: `${username} is no authorized`,
        });
      }
    })
  );
};
