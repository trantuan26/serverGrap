'use strict';
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const jwt = require('jsonwebtoken');
const User = mongoose.model('User');
const config = require("../config");
const passwordValidator = require('password-validator');
// Create a schema
var checkPass = new passwordValidator();

// Add properties to it
checkPass
    .is().min(8)                                    // Minimum length 8
    .is().max(100)                                  // Maximum length 100
    .has().uppercase()                              // Must have uppercase letters
    .has().lowercase()                              // Must have lowercase letters
    .has().digits()                                 // Must have digits
    .has().symbols()                                 // Must have symbols
    .has().not().spaces();                           // Should not have spaces
    //.is().not().oneOf(['Passw0rd', 'Password123']); // Blacklist these values

exports.register = function (req, res) {
    if (checkPass.validate(req.body.password)){
        let newUser = new User(req.body);
        newUser.password = bcrypt.hashSync(req.body.password, saltRounds);
        newUser.save(function (err, user) {
            if (err) {
                return res.status(400).send({
                    message: err
                });
            } else {
                user.password = undefined;
                return res.json(user);
            }
        });
    } else {
        return res.status(400).send({
            message: 'Minimum length 8, ' +
                'Maximum length 100, ' +
                'Must have uppercase letters, ' +
                'Must have lowercase letters, ' +
                'Must have digits, ' +
                'Must have symbols, ' +
                'Should not have spaces'

        });
    }
}

exports.sign_in = function (req, res) {
    User.findOne({
        email: req.body.email
    }, function (err, user) {
        if (err) throw err;
        if (!user) {
            res.status(401).json({
                message: 'Authentication failed. User not found.'
            })
        } else if (user) {
            if (!user.comparePassword(req.body.password)) {
                res.status(401).json({
                    message: 'Authentication failed. Wrong password.'
                })
            } else {
                return res.json({
                    token: jwt.sign({
                            first_name: user.first_name,
                            last_name: user.last_name,
                            phone_number: user.phone_number,
                            avatar_link: user.avatar_link,
                            create_at: user.create_at,
                            email: user.email,
                            _id: user._id
                        },
                        config.secret)
                });
            }
        }
    })
}

exports.loginRequired = function(req, res, next) {
    if (req.user) {
        next();
    } else {
        return res.status(401).json({ message: 'Unauthorized user!' });
    }
};