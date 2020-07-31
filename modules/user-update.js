var db;
module.exports.setDb = (_db) => {
    db = _db;
};

module.exports.updateFileView = async (data) => {
    let file = db.file.findByPk(data.id);
    if (file) {
        await file.update({ ViewCount: file.ViewCount + 1 });
    }
};

module.exports.recentFolder = async ({ FolderId, CurrentFile }, user) => {
    // console.log("file-update", data, user && user.Name);
    console.log("folder update", FolderId, CurrentFile);
    let recent = await db.recentFolder.findOrCreate({
        where: { FolderId, RecentId: user.Recent.Id },
    });
    await recent[0].update({ LastRead: new Date(), CurrentFile: CurrentFile });
};

module.exports.updateFilePos = async (data, user) => {
    // console.log("file-update", data, user && user.Name);
    console.log("recent-file", data);
    let recent = await db.recentFile.findOrCreate({
        where: { FileId: data.Id, RecentId: user.Recent.Id },
    });
    await recent[0].update({ LastRead: new Date(), LastPos: data.CurrentPos || 0 });
};

module.exports.updateConfig = async (data, user) => {
    let Config = JSON.parse(user.UserConfig.Config);

    let { volume, mute, pause } = data.config;
    if (Config.video) {
        Config.video.volume = volume;
        Config.video.mute = mute;
        Config.video.pause = pause;

        await db.userConfig.update(
            { Config: JSON.stringify(Config) },
            { where: { UserId: user.Id } }
        );
    }
};

const removeById = function (arr, Id) {
    var i = arr.length;
    while (i--) {
        if (arr[i] instanceof Object && arr[i].Id == Id) {
            return arr.splice(i, 1)[0];
        }
    }
};

module.exports.updateRecentFolders = async (data, user) => {
    let folder = await db.folder.findOne({
        attributes: ["Id", "Name", "Type", "Cover", "FileCount"],
        where: { Id: data.id },
    });

    if (!folder) return;

    let Config = JSON.parse(user.UserConfig.Config);
    let recentsF = [...Config.recentFolders];
    let recent = removeById(recentsF, data.id);
    // Create a recent
    if (!recent) {
        recent = {
            ...folder.dataValues,
            FileId: data.fileId,
        };
    } else {
        //Update old recent
        recent.FileId = data.fileId;
    }
    recentsF.unshift(recent);
    //Remove if over 50
    if (recentsF.length > 18) recentsF.pop();

    await user.UserConfig.update({
        Config: { Config: JSON.parse(Config), recentFolders: recentsF },
    });
};
