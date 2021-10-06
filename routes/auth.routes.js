const { Router } = require('express');
const router = Router();
const bcrypt = require('bcryptjs');
const { check, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const config = require('config');
const passport = require('passport');
const mysql = require("mysql2/promise");
const mysqlConnectionData = require('../config/mysqlConnectionData')

router.post(
    '/register',
    [
        check('login', 'incorrect login')
            .isLength({ min: 6 }),
        check('password', 'password is too small!')
            .isLength({ min: 6 })
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if(!errors.isEmpty()) {
                return res.status(400).json({
                    errors: errors.array(),
                    message: 'incorrect data during registration!',
                })
            }
            const { login, password, name, last_name, followed,
            photo, date_of_birth, city, education, web_site } = req.body;

            let sqlCheckLogin = `SELECT * FROM users WHERE login = '${login}'`;

            const connection = await mysql.createConnection(mysqlConnectionData);
            const [ candidate, fields ] = await connection.execute(sqlCheckLogin);
            if(candidate.length !== 0) {
                return res.status(400).json({ message: 'Such user already exists!' })
            };
            const hashedPassword = await bcrypt.hash(password, 12);

            let sqlAddUser = 
                `INSERT users(login, password, name, last_name, followed,
                    photo, date_of_birth, city, education, web_site)
                VALUES ('${login}', '${hashedPassword}', '${name}', '${last_name}', '${followed}',
                    '${photo}', '${date_of_birth}', '${city}', '${education}', '${web_site}')`;

            await connection.execute(sqlAddUser);
            res.status(201).json({ message: 'User create' })
        } catch (error) {
            res.status(500).json({ message: 'Something went wrong, try again!', error})
        }
    }
);

router.post(
    '/login',
    [
        check('login', 'incorrect login')
            .isLength({ min: 6 }),
        check('password', 'password is too small!')
            .isLength({ min: 6 })
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
    
            if(!errors.isEmpty()) {
                return res.status(400).json({
                    errors: errors.array(),
                    message: 'incorrect data when entering the system!'
                })
            }
            const {login, password} = req.body;

            let sqlCheckLogin = `SELECT * FROM users WHERE login = '${login}'`;

            const connection = await mysql.createConnection(mysqlConnectionData);
            const [ user, fields ] = (await connection.execute(sqlCheckLogin))[0];
            if(!user) {
                return res.status(400).json({ message: 'user is not found!' })
            };
            const hashedPassword = await bcrypt.hash(password, 12);

            const isMatch = await bcrypt.compare(password, user.password);

            if(!isMatch) {
                return res.status(400).json({ message: 'incorrect password, try again!' })
            }

            const token = jwt.sign(
                { personID: user.personID },
                config.get('jwtSecret'),
                { expiresIn: '1h' }
            );
            res.cookie('token', `Bearer ${token}`)
            res.json({ token: 'Bearer ' + token, personID: user.personID });
        } catch (e) {
            res.status(500).json({ message: 'Something went wrong, try again!', e});
        }
    }
);

router.get(
    '/dashboard',
    passport.authenticate('cookie', {session: false}),
    (req, res) => {
        try {
            res.json({ 
                personID: req.user.user.personID,
                login: req.user.user.login,
                name: req.user.user.name,
                last_name: req.user.user.last_name,
                followed: req.user.user.followed,
                photo: req.user.user.photo,
                date_of_birth: req.user.user.date_of_birth,
                city: req.user.user.city,
                education: req.user.user.education,
                web_site: req.user.user.web_site
            })
        } catch (error) {
            res.status(500).json({ message: 'Something went wrong, try again!', error})
        }
    }
);

module.exports = router;