const Sequelize = require('sequelize');
const sequelize = new Sequelize('tableName', 'userName', 'password', {
    host: 'localhost',
    dialect: 'mysql',
    operatorsAliases: false,
    define: {
        charset: 'utf8'
    },
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    },
});

const Users = sequelize.define('users', {
    nickName: {
        type: Sequelize.STRING,
    },
    socketId: {
        type: Sequelize.STRING
    },
    isOnline: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
    }

});

Users.sync().then(()=> Messages.sync());  //create tables using models

const Messages = sequelize.define('messages', {
    message: {
        type: Sequelize.TEXT,
    }
});

Messages.belongsTo(Users);

module.exports = {
    Users: Users,
    Messages: Messages,
    sequelize: sequelize
};


