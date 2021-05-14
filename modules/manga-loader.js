const StreamZip = require("node-stream-zip");
const path = require("path");
const fs = require("fs-extra");
var db;
var users = {};
const iUser = { lastId: "" };

module.exports.removeZip = (id) => {
    delete users[id];
};

module.exports.setDb = (_db) => {
    db = _db;
};

const loadZipImages = async (data, socket, curUser) => {
    let { Id, indices } = data;
    //get last user or create
    if (!users[curUser.Id]) {
        users[curUser.Id] = iUser;
    }

    let user = users[curUser.Id];
    if (user.lastId === Id) {
        try {
            for (let i of indices) {
                let entry = user.entries[i];
                if (entry) {
                    socket.emit("image-loaded", {
                        page: i,
                        img: user.zip.entryDataSync(entry).toString("base64"),
                        id: data.Id
                    });
                }
            }
            socket.emit("image-loaded", { last: true });
        } catch (error) {
            users[curUser.Id].lastId = "";
            loadZipImages(data, socket);
        }
    } else {
        let file = await db.file.findOne({
            attributes: ["Id", "Name"],
            where: { Id },
            include: { model: db.folder },
        });
        if (file) {
            user.lastId = Id;
            let filePath = path.resolve(file.Folder.Path, file.Name);
            if (fs.existsSync(filePath)) {
                user.zip = new StreamZip({
                    file: filePath,
                    storeEntries: true,
                });

                user.zip.on("ready", () => {
                    let entries = Object.values(user.zip.entries())
                        .sort((a, b) => {
                            return String(a.name).localeCompare(String(b.name));
                        })
                        .filter((entry) => {
                            return !entry.isDirectory;
                        });

                    user.entries = entries;

                    for (let i of indices) {
                        if (user.entries[i]) {
                            socket.emit("image-loaded", {
                                page: i,
                                img: user.zip
                                    .entryDataSync(user.entries[i])
                                    .toString("base64"),
                                id: file.Id
                            });
                        }
                    }
                    socket.emit("image-loaded", { last: true });
                });

                user.zip.on("error", (err) => {
                    socket.emit("image-loaded", { error: "some error" });
                    console.log(err);
                    user.zip.close();
                });
            } else {
                console.log("file no found", file && file.Name);
                socket.emit("manga-error", { error: "File Not Found" });
            }
        }
    }
};

module.exports.loadZipImages = loadZipImages;
