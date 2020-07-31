const Router = require("express").Router();
const KeysMap = require("./KeysMap");

const db = require("../../models");

Router.get("/", (req, res) => {
    db.user.findAll({ order: ["Name"] }).then((users) => {
        return res.send({
            users: users.map((u) => {
                return { ...u.dataValues, Password: "" };
            }),
        });
    });
});

const validate = async (req, remove) => {
    let { Role, State } = req.body;
    let users = await db.user.findAll();
    let adminsCount = users.filter((a) => a.Role.includes("Administrator")).length;
    let user = users.find((u) => u.Id === req.body.Id);

    if (remove && /admin/gi.test(user.Role) && adminsCount === 1) {
        return { isValid: false };
    }

    if (
        /admin/gi.test(user.Role) &&
        adminsCount === 1 &&
        (!/admin/gi.test(Role) || !/Active/gi.test(State))
    ) {
        return { isValid: false };
    }

    return { user, isValid: true };
};

const addEdit = async (req, res) => {
    let { Id } = req.body;
    if (!Id) {
        let { Name } = req.body;
        let user = {
            ...req.body,
            CreatedAt: new Date(),
            Favorites: [{ Name: "Default" }],
            Recent: {
                Name,
            },
            UserConfig: {
                Name,
                Config: JSON.stringify({
                    order: "nu",
                    items: 0,
                    recentFolders: [],
                    video: { KeysMap, volume: 0.3, pause: true, mute: false },
                    manga: { KeysMap, scaleX: 0.6, scaleY: 1, aniDuration: 300 },
                }),
            },
        };
        delete user.Id;
        let newUser = await db.user.create(user, {
            include: [db.recent, db.favorite, db.userConfig],
        });

        return res.send({
            user: { ...newUser.dataValues, Password: "" },
            fail: false,
        });
    } else {
        let valid = await validate(req);
        if (valid.isValid) {
            if (valid.user) {
                let data = { Id: "", ...req.body };
                if (!data.Password) delete data.Password;
                await valid.user.update(data);
                return res.send({ fail: false, user: req.body });
            } else {
                return res.send({
                    fail: false,
                    msg: `Could't update User ${req.body.Name}, Was not found`,
                });
            }
        } else {
            return res.send({
                msg: "Can't change Privileges to the only administrator",
                fail: true,
            });
        }
    }
};

Router.post("/add-edit", (req, res) => {
    addEdit(req, res).catch((err) => {
        let error = (err.errors && err.errors[0]) || err;
        console.log(error);
        return res.send({ fail: true, msg: "error" });
    });
});

const remove = async (req) => {
    let valid = await validate(req, true);
    if (valid.isValid) {
        if (valid.user) {
            await valid.user.destroy();
            return { removed: true };
        } else {
            return { removed: false, msg: "User Not Found" };
        }
    } else {
        return { removed: false, msg: "Can't remove the only admin" };
    }
};

Router.delete("/remove", (req, res) => {
    remove(req)
        .then((result) => {
            return res.send(result);
        })
        .catch((err) => {
            console.log(err);
            return res.send({ removed: false, msg: "Server Error 500" });
        });
});

module.exports = Router;
