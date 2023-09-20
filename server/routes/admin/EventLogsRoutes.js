import db from "../../models/index.js";

export const getEvents = async (req, res) => {
  const { page = 1 } = req.params;
  const offset = (page - 1) * 100 || 0;
  const events = await db.eventLog.findAll({ order: [["Date", "DESC"]], limit: 100, offset });
  return res.send(
    events.map((e) => {
      delete e.dataValues.event;
      return e.dataValues;
    })
  );
};
