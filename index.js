'use strict';

var express = require('express'),
    app = express(),
    port = process.env.PORT || 3000,
    mongoose = require('mongoose'),
    Task = require('./models/todoListModel'),
    User = require('./models/userModel'),
    bodyParser = require('body-parser'),
    jsonwebtoken = require("jsonwebtoken");

const config = require("./config");

mongoose.Promise = global.Promise;
mongoose.connect(config.database);


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(function(req, res, next) {
    if (req.headers && req.headers.authorization && req.headers.authorization.split(' ')[0] === config.bearer) {
        jsonwebtoken.verify(req.headers.authorization.split(' ')[1], config.secret, function(err, decode) {
            if (err) req.user = undefined;
            req.user = decode;
            next();
        });
    } else {
        req.user = undefined;
        next();
    }
});
var routes = require('./routes/todoListRoutes');
routes(app);

app.use(function(req, res) {
    res.status(404).send({ url: req.originalUrl + ' not found' })
});

app.listen(port);

console.log('todo list RESTful API server started on: ' + port);

module.exports = app;