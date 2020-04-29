"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn("Folders", "FilesType", {
      type: Sequelize.STRING(10),
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn("Folders", "FilesType");
  },
};
