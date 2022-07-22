const express = require('express')
require('./logger');
const cors = require('cors') // Allows our server to receive requests from clients on a different origins
var cookieParser = require('cookie-parser')
const path = require('path');
const dotenv = require('dotenv')
const csrf = require("csurf");
dotenv.config() // Makes environment variables available


const csrfMiddleware = csrf({ cookie: true });

// Import routes
const walletManagment = require('./routes/wallets_managment')

const port = process.env.PORT || 3000

// Initialize server
const app = express()
app.use(express.json({ limit: '500mb' }));
app.use(express.urlencoded({ extended: true, limit: '500mb' }));
app.use(cookieParser());
app.use(cors())
app.use(csrfMiddleware);


// CORS configuration
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.all("*", (req, res, next) => {
    res.cookie("XSRF-TOKEN", req.csrfToken());
    next();
});

app.use(express.static(path.resolve(__dirname, "../frontend")));


// Use routes
app.use(walletManagment);

app.get('/', (req, res) => {
    res.sendFile(path.resolve(__dirname, "../frontend/html/index.html"))
});

// Listening for incoming connections
app.listen(port, () => {
    console.log(`Listening on port ${port}`)
})
