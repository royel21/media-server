export default (sequelize, { INTEGER, STRING }) =>
  sequelize.define("Directories", {
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
      allowNull: false,
    },
  });
