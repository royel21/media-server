import { DataTypes } from "sequelize";

export default (sequelize) => {
  const { STRING, INTEGER, BOOLEAN } = DataTypes;
  const Hotkey = sequelize.define(
    "Hotkeys",
    {
      Id: {
        type: INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      Key: {
        type: INTEGER,
        allowNull: false,
      },
      Name: {
        type: STRING(100),
        allowNull: false,
      },
      CtrlKey: {
        type: BOOLEAN,
        defaultValue: 0,
      },
      ShiftKey: {
        type: BOOLEAN,
        defaultValue: 0,
      },
      AltKey: {
        type: BOOLEAN,
        defaultValue: 0,
      },
    },
    {
      timestamps: false,
    }
  );

  return Hotkey;
};
