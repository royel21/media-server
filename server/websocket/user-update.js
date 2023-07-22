import db from "../models/index.js";

const recentFolder = async ({ FolderId, CurrentFile }, user) => {
  try {
    let recent = await db.recentFolder.findOrCreate({
      where: { FolderId, RecentId: user.Recent.Id },
    });
    await recent[0].update({ LastRead: new Date(), CurrentFile: CurrentFile });
  } catch (error) {
    console.log("update-recent-error", error);
  }
};

const updateFilePos = async (data, user) => {
  try {
    let recent = await db.recentFile.findOrCreate({
      where: { FileId: data.Id, RecentId: user.Recent.Id },
    });
    await recent[0].update({ LastPos: data.CurrentPos || 0 });
  } catch (error) {
    console.error(error?.Message);
  }
};

const updateConfig = async (data, user) => {
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

export default {
  updateConfig,
  updateFilePos,
  recentFolder,
};
