const Sequelize = require('sequelize');
const db = require('./db');

const Sala = db.define('salas', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    nome: {
        type: Sequelize.STRING,
        allowNull: false
    }
});

//Criar a tabela
// Sala.sync();

//Truncate
// Sala.sync({force: true});

module.exports = Sala;