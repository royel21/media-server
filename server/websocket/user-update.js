import db from "#server/models/index";

const recentFolder = async ({ FolderId, CurrentFile }, user) => {
  if (FolderId) {
    try {
      let recent = await db.recentFolder.findOrCreate({
        where: { FolderId, UserId: user.Id },
      });
      await recent[0].update({ LastRead: new Date(), CurrentFile: CurrentFile });
    } catch (error) {
      // console.log("update-recent-error", error);
    }
  }
};

const updateFilePos = async (data, user) => {
  if (data.Id) {
    try {
      let recent = await db.recentFile.findOrCreate({
        where: { FileId: data.Id, UserId: user.Id },
      });
      await recent[0].update({ LastPos: data.CurrentPos || 0 });
    } catch (error) {
      // console.error(error?.Message);
    }
  }
};

export default {
  updateFilePos,
  recentFolder,
};
