import db from "#server/models/index";

const getServer = async (req, res) => {
  const { Id } = req.params;
  const server = await db.Server.findOne({ where: { Id } });
  res.send(server.dataValues);
};
const getServers = async (req, res) => {
  const servers = await db.Server.findAll({ order: ["Name"] });
  res.send({
    valid: true,
    servers: servers.map((s) => s.dataValues),
  });
};

const changeState = async (req, res) => {
  const { Id } = req.params;
  try {
    const server = await db.Server.findOne({ where: { Id } });
    if (server) {
      await server.update({ Enable: !server.Enable });
      return res.json({ valid: true });
    }
  } catch (error) {
    console.log(error);
  }

  res.send({ valid: false });
};

const removeServer = async (req, res) => {
  const { Id } = req.params;
  const result = await db.Server.destroy({ where: { Id } });
  res.send({ valid: result });
};

export default {
  getServer,
  getServers,
  changeState,
  removeServer,
};
