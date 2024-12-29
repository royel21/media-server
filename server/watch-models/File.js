export default (sequelize, { INTEGER, DATE, STRING, VIRTUAL }) =>
  sequelize.define(
    "Files",
    {
      Id: {
        type: INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      Name: {
        type: STRING,
        allowNull: false,
      },
      Path: { type: STRING, allowNull: false },
      Size: {
        type: INTEGER,
        defaultValue: 0,
      },
      LastModified: {
        type: DATE,
      },
      Extension: {
        type: VIRTUAL,
        get() {
          return this.Name.split(".").pop();
        },
      },
      DirectoryId: {
        type: INTEGER,
      },
    },
    {
      uniqueKeys: {
        Uniq_File: {
          fields: ["Path", "DirectoryId"],
        },
      },
    }
  );
