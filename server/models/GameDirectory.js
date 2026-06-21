export default (sequelize, { INTEGER, STRING }) => {
  const GameDirectory = sequelize.define("GameDirectories", {
    Id: {
      type: INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    Name: {
      type: STRING(255),
      allowNull: false,
    },
    Path: {
      type: STRING(255),
      unique: true,
      allowNull: false, defaultValue: ""
    },
  });
  return GameDirectory;
};
