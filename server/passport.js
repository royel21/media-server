import { Strategy as LocalStrategy } from "passport-local";
import db from "./models/index.js";
import passport from "passport";
import { literal } from "sequelize";

export default () => {
  const deserializeUser = async (username, done) => {
    const user = await db.user.findOne({
      order: [literal("LOWER(Favorites.Name)")],
      where: {
        Name: username,
      },
      include: [{ model: db.favorite, attributes: ["Id", "Name"] }],
    });

    if (user) {
      done(null, user);
    } else {
      done(null, false, {
        type: "user",
        message: `${username} is no authorized`,
      });
    }
  };

  const strategy = new LocalStrategy(
    { usernameField: "username", passwordField: "password" },
    async (username, password, done) => {
      const user = await db.user.findOne({
        order: [literal("LOWER(Favorites.Name)")],
        where: {
          Name: username,
        },
        include: [{ model: db.favorite, attributes: ["Id", "Name"] }],
      });
      const isValid = user?.validPassword(password);
      if (isValid) {
        done(null, user);
      } else {
        done(null, false, {
          type: "user",
          message: `${username} is no authorized`,
        });
      }
    }
  );

  passport.serializeUser((user, done) => done(null, user.Name));
  passport.deserializeUser(deserializeUser);
  passport.use(strategy);

  return passport;
};
