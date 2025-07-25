import db from "#server/models/index";

export const excludeChapList = async (req, res) => {
  const { Id } = req.params;
  const link = await db.Link.findOne({ where: { Id } });
  if (link?.Name) {
    const names = await db.Exclude.findAll({ where: { LinkName: link?.Name } });
    return res.send(names.map((n) => n.dataValues));
  }
  res.send([]);
};

export const addExcludeChap = async ({ body }, res) => {
  const { nameList } = body;
  for (let name of nameList || []) {
    try {
      if (/^new-/.test(name.Id)) {
        delete name.Id;
        await db.Exclude.create(name);
      } else {
        await db.Exclude.update(name, { where: { Id: +name.Id } });
      }
    } catch (error) {
      console.log(error);
    }
  }

  res.send({ valid: true });
};

export const removeExcludeChap = async (req, res) => {
  const { Id } = req.params;
  let valid = 0;
  try {
    valid = await db.Exclude.destroy({ where: { Id } });
  } catch (error) {
    console.log("Id", Id, error);
  }
  res.send({ valid });
};

export default {
  excludeChapList,
  addExcludeChap,
  removeExcludeChap,
};
