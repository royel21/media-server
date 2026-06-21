export default (sequelize, { DATE, STRING, TEXT }) => {
  const Info = sequelize.define("Infos", {
    Codes: { type: STRING, primaryKey: true },
    AltName: { type: TEXT },
    Company: { type: STRING },
    Lang: { type: STRING(100) },
    Genres: { type: STRING(100) },
    ReleaseDate: { type: DATE },
    Description: { type: TEXT },
    OS: { type: STRING, defaulValue: "Windows 10" },
  });
  return Info;
};
