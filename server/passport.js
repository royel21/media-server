import { Strategy as LocalStrategy } from "passport-local";
import db from "./models/index.js";
import passport from "passport";
import { literal } from "sequelize";
import defaultConfig from "./default-config.js";
import { getElapseSec } from "./utils.js";

export default () => {
  const getQuery = (Name) => ({
    order: [literal("LOWER(Favorites.Name)")],
    where: { Name },
    include: [
      { model: db.favorite, attributes: ["Id", "Name"] },
      { model: db.hotkey },
      { model: db.sorttab, order: ["Id"] },
    ],
  });

  const deserializeUser = async (username, done) => {
    const user = await db.user.findOne(getQuery(username));
    if (user) {
      done(null, user);
    } else {
      done(null, false, {
        type: "user",
        message: [`User Not Authorized`],
      });
    }
  };
  const userFields = { usernameField: "username", passwordField: "password" };

  const strategy = new LocalStrategy(userFields, async (username, password, done) => {
    const config = await db.AppConfig.findOne();

    const user = await db.user.findOne(getQuery(username));

    const error = {
      message: ["User Not Authorized"],
    };

    if (!user) {
      return done(null, false, error);
    }

    if (user.State === "InActive") {
      return done(null, false, error);
    }

    if (!/^(172|192|10)/.test(global.url)) {
      const time = getElapseSec(user.LastLogin, new Date());

      if (time < config.LoginTimeout) {
        const timeLeft = config.LoginTimeout - time;
        return done(null, false, { message: [`Wait ${parseInt(timeLeft)} Seconds`] });
      }

      error.locked = user.LoginCount > config.LoginLockCount - 1;
      if (error.locked) {
        return done(null, false, {
          user,
          ...error,
          locked: error.locked,
        });
      }
    }

    const isValid = user?.validPassword(password);
    if (!isValid) {
      await user.update({ LastLogin: new Date() });
      user.LoginCount++;
      await user.save();
      return done(null, false, error);
    }

    return done(null, user);
  });

  passport.serializeUser((user, done) => done(null, user.Name));
  passport.deserializeUser(deserializeUser);
  passport.use(strategy);

  return passport;
};
