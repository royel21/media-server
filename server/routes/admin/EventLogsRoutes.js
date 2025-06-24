import db from "#server/models/index";

const MAX_EVENTS = 200;

export const allEvents = async (req, res) => {
  const eventCount = await db.eventLog.count();
  let offset = eventCount - MAX_EVENTS;

  if (offset < 0) offset = 0;

  const events = await db.eventLog.findAll({ offset, limit: MAX_EVENTS });
  return res.send(events.map((e) => e.dataValues));
};

export const clearEvents = async (req, res) => {
  db.eventLog.destroy({ truncate: true });
  res.send({ valid: true });
};

export default { allEvents, clearEvents };
