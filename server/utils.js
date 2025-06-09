import db from "./models/index.js";

export const sendMessage = async (data, event = "info", log = true) => {
  if (data.msg || data.text || data.error) {
    console.log(data.msg || data.text || "", data.error || "");
  }

  if ((data.msg || data.text) && log) {
    if (log) {
      const newEvent = {
        event,
        ...data,
        text: data.msg || data.text,
        Id: null,
      };

      delete newEvent.Id;

      await db.eventLog.create(newEvent);
    }
  }
  process.send({ event, message: data });
};

export const getProgress = (count, length) => {
  const padding = length.toString().length;
  count = count.toString().padStart(padding, "0");
  return `${count}/${length}`;
};
