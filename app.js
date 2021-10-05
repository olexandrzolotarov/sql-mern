const express = require('express');
const config = require('config');
const bodyParser = require('body-parser');
const passport = require('passport');


const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(passport.initialize());

require('./config/passport')(passport);

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