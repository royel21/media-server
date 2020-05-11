"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn("RecentFolders", "LastRead", {
      type: Sequelize.DATE,
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn("RecentFolders", "LastRead");
  },
};
