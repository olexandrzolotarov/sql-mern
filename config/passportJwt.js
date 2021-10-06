const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const keys = require('./default.json');
const mysqlConnectionData = require('./mysqlConnectionData');
const mysql = require("mysql2/promise");


const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = keys.jwtSecret;

module.exports = passport => {
    passport.use(new JwtStrategy(opts, async (jwt_payload, done) => {
        try {
            let sqlCheckLogin = `SELECT * FROM users WHERE personID = '${jwt_payload.personID}'`;
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

