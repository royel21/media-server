"use strict";

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.addColumn("Folders", "Description", {
            type: Sequelize.TEXT,
        });
    },

    down: (queryInterface, Sequelize) => {
        return queryInterface.removeColumn("Folders", "Description");
    },
};
