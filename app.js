const express = require('express');
const config = require('config');
const passport = require('passport');
const cookieParser = require('cookie-parser');




const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser())

app.use(passport.initialize());

// require('./config/passportJwt')(passport);
require('./config/passportCookie')(passport);



app.get('/', function (req, res) {
    res.json({ msg: 'token received!' })
  })

app.use('/api/auth', require('./routes/auth.routes'));

const PORT = config.get('port') || 5000;

async function start() {
    try {
        app.listen(PORT, () => console.log(`app has been started on port: ${PORT}...`));
    } catch (e) {
        console.log('Server error', e.message);
        process.exit(1);
    }
}

start();