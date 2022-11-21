const express = require('express')
const session = require('express-session')
const redis = require('redis')
const connectRedis = require('connect-redis')
const PORT = 8000

const app = express()

app.use(express.json());
app.use(express.urlencoded({ extended: false }))

const redisStore = connectRedis(session)


//configure redis client
const redisClient = redis.createClient({
    host: '127.0.0.1',
    port: 6380,
    enableOfflineQueue: false,
    retry_strategy(options) {
        if (options.error && options.error.code === 'ECONNREFUSED') {
            return new Error('The server refused the connection');
        }
        if (options.total_retry_time > 1000 * 60 * 60) {
            return new Error('Retry time exhausted');
        }
        if (options.times_connected > 10) {
            return undefined;
        }
        return Math.max(options.attempt * 100, 3000);
    },
}).connect();


app.use(session({
    store: new redisStore({ client: redisClient }),
    secret: 'secret$%^134',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        httpOnly: false,
        maxAge: 1000 * 60 * 10
    }
}))

app.get('/', (req, res) => {
    console.log("req rcvd")
    const sess = req.session;
    if (sess.username && sess.password) {
        if (sess.username) {
            res.write(`<h1>Welcome ${sess.username} </h1><br>`)
            res.write(
                `<h3>This is the Home page</h3>`
            );
            res.end('<a href=' + '/logout' + '>Click here to log out</a >')
        } else {
            res.sendFile(__dirname + "/public/login.html")
        }
    }
    else {
        res.redirect('/login')
    }
    // res.redirect('/login');
})

app.get('/home', (req, res) => {
    if (req.session?.loggedIn) {
        console.log('logged in')
        res.sendFile(__dirname + '/public/home.html')
    } else {
        console.log('not logged in')
        res.sendFile(__dirname + '/public/login.html')
    }
})

app.get('/login', (req, res) => {
    res.sendFile(__dirname + '/public/login.html')
})

app.post("/login", (req, res) => {
    console.log("rew rcvd")
    redisClient.connect()

    const sess = req.session;
    const { username, password } = req.body
    sess.username = username
    sess.password = password
    // add username and password validation logic here if you want.If user is authenticated send the response as success
    res.end("success")
});

app.listen(PORT, () => {
    console.log(`app listening on http://localhost:${PORT}`)
})