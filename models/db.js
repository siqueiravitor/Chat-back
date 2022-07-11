const Sequelize = require('sequelize');

const sequelize = new Sequelize('siqueiravitor', 'root', '', {
    host: 'localhost',
    dialect: 'mysql'
});

// sequelize.authenticate()
// .then(()=> {
//     console.log('Conectado com sucesso ao BD!')
// })
// .catch(()=>{
//     console.log('Erro ao conectar com o BD')
// })

module.exports = sequelize;