export default (sequelize, { INTEGER, STRING, BOOLEAN }) => {
  const Folder = sequelize.define("Servers", {
    Id: {
      type: INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    Name: {
      type: STRING(255),
      allowNull: false,
    },
    Type: {
      type: STRING(50),
      defaultValue: "Manga",
      allowNull: false,
    },
    Title: {
      type: STRING(50),
      defaultValue: ".post-title",
      allowNull: false,
    },
    AltTitle: {
      type: STRING(50),
      defaultValue: ".post-status .post-content_item .summary-content",
      allowNull: false,
    },
    Chapters: {
      type: STRING(50),
      defaultValue: ".wp-manga-chapter a",
      allowNull: false,
    },
    Imgs: {
      type: STRING(50),
      defaultValue: ".reading-content img",
      allowNull: false,
    },
    Cover: {
      type: STRING(50),
      defaultValue: ".tab-summary .summary_image img",
      allowNull: false,
    },
    Desc: {
      type: STRING(50),
      defaultValue: ".summary__content p:nth-child(2)",
      allowNull: false,
    },
    Genres: {
      type: STRING(50),
      defaultValue: ".genres-content",
      allowNull: false,
    },
    Status: {
      type: STRING(100),
      defaultValue: ".post-status .post-content_item .summary-content",
      allowNull: false,
    },
    Raw: {
      type: BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    LocalImages: {
      type: BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    HomeQuery: {
      type: STRING,
      defaultValue: "",
    },
  });
  return Folder;
};
