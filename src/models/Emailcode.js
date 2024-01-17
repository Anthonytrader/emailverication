const { DataTypes } = require('sequelize');
const sequelize = require('../utils/connection');

const Emailcode = sequelize.define('Emailcode', {
    code: {
        type: DataTypes.STRING,
        allowNull: false
    },
    
});

module.exports = Emailcode;