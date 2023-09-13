export default (sequelize, { INTEGER, STRING, BOOLEAN }) => {
  return sequelize.define("NameLists", {
    Id: {
      type: INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    Name: {
      type: STRING,
      unique: true,
      defaultValue: "",
    },
    AltName: {
      type: STRING(150),
      defaultValue: "",
    },
  });
};
