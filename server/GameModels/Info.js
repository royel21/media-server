export default (sequelize, { DATE, STRING, TEXT }) => {
  const Info = sequelize.define("Info", {
    Codes: { type: STRING, primaryKey: true },
    AltName: { type: TEXT },
    Company: { type: STRING },
    Lang: { type: STRING(40) },
    Genres: { type: STRING(100) },
    ReleaseDate: { type: DATE },
    Description: { type: TEXT },
  });
  return Info;
};
