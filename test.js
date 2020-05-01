const db = require("./models");

const testDb = async () => {
  let file = await db.file.getFile("Administrator");
};

db.init().then(testDb);
