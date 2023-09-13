export default (sequelize, { INTEGER, STRING }) => {
  return sequelize.define(
    "Excludes",
    {
      Id: {
        type: INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      Name: {
        type: STRING,
        defaultValue: "",
      },
      LinkName: {
        type: STRING,
      },
    },
    {
      uniqueKeys: {
        name_link_exclude: {
          fields: ["Name", "LinkName"],
        },
      },
    }
  );
};
