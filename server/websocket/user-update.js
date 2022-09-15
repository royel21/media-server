const db = require("../models");

module.exports.updateFileView = async (data) => {
  let file = db.file.findByPk(data.id);
  if (file) {
    await file.update({ ViewCount: file.ViewCount + 1 });
  }
};

module.exports.recentFolder = async ({ FolderId, CurrentFile }, user) => {
  try {
    let recent = await db.recentFolder.findOrCreate({
      where: { FolderId, RecentId: user.Recent.Id },
    });
    await recent[0].update({ LastRead: new Date(), CurrentFile: CurrentFile });
  } catch (error) {
    console.log(error);
  }
};

module.exports.updateFilePos = async (data, user) => {
  try {
    let recent = await db.recentFile.findOrCreate({
      where: { FileId: data.Id, RecentId: user.Recent.Id },
    });
    await recent[0].update({ LastRead: new Date(), LastPos: data.CurrentPos || 0 });
  } catch (error) {
    console.log(error);
  }
};

module.exports.updateConfig = async (data, user) => {
  try {
    let Config = JSON.parse(user.UserConfig.Config);

    let { volume, mute, pause } = data.config;
    if (Config.video) {
      Config.video.volume = volume;
      Config.video.mute = mute;
      Config.video.pause = pause;

      await db.userConfig.update({ Config: JSON.stringify(Config) }, { where: { UserId: user.Id } });
    }
  } catch (error) {
    console.log(error);
  }
};
