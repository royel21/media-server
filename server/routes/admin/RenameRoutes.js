import db from "../../models/index.js";

export const renameList = async (_, res) => {
  const names = await db.NameList.findAll({ order: ["AltName"] });
  res.send(names.map((n) => n.dataValues));
};

export const addAltname = async ({ body }, res) => {
  const { nameList } = body;
  for (let name of nameList || []) {
    try {
      if (/^new-/.test(name.Id)) {
        delete name.Id;
        await db.NameList.create(name);
      } else {
        await db.NameList.update(name, { where: { Id: +name.Id } });
      }
    } catch (error) {
      console.log(error);
    }
  }

  res.send({ valid: true });
};

export const removeAltname = async (req, res) => {
  const { Id } = req.params;
  let valid = 0;
  try {
    valid = await db.NameList.destroy({ where: { Id } });
  } catch (error) {
    console.log("Id", Id, error);
  }
  res.send({ valid });
};

export default {
  renameList,
  addAltname,
  removeAltname,
};
