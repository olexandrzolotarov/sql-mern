const CookieStrategy = require('passport-cookie');
const jwt = require('jsonwebtoken');
const config = require('config');
const mysqlConnectionData = require('./mysqlConnectionData');
const mysql = require("mysql2/promise");

module.exports = (passport) => {
    passport.use(new CookieStrategy( async (token, done) => {
        try {
            const tokenSecond = token.split(' ')[1];
            const decoded = jwt.verify(tokenSecond, config.get('jwtSecret'));
    
            let sqlCheckLogin = `SELECT * FROM users WHERE personID = '${decoded.personID}'`;
            const connection = await mysql.createConnection(mysqlConnectionData);
            const [ user, fields ] = (await connection.execute(sqlCheckLogin))[0];
            if(user.personID) {
                return done(null, {user: user});
            }
            return done(null, false);    
        } catch (error) {
            res.status(500).json({ message: 'Something with authorization went wrong, try again!', error})
        }
    }))
}
