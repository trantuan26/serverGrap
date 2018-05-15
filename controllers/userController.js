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
var nodemailer = require('nodemailer');

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

// completely pointless, but whatever
var rn = require('random-number');
var options = {
    min: 100000,
    max: 999999
    , integer: true
}

let Send_mail = async (mail, Verification) => {

    let transporter = await nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'mailfortest32018@gmail.com',
            pass: 'TrinhVM@1'
        }
    });

    await console.log("email " + mail);

    let mailOptions = await {
        from: 'mailfortest32018@gmail.com',
        to: mail,
        subject: 'Account Verification',
        text: 'Your confirmation code: ' + Verification,
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            return false
        } else {
            return true
        }
    });

}


exports.register = function (req, res) {
    if (checkPass.validate(req.body.password)) {
        let newUser = new User(req.body);
        newUser.password = bcrypt.hashSync(req.body.password, saltRounds);
        newUser.save(function (err, user) {
            if (err) {
                return res.status(400).send({
                    message: err,
                    value: false
                });
            } else {
                if (user) {
                    let Verification = rn(options);
                    if (Send_mail(newUser.email, Verification)) {
                        return res.json({
                            value: true,
                            message: Verification
                        });
                    } else {
                        return res.json({
                            value: false,
                            "message": "Send mail failed !"
                        });
                    }

                }
                else {
                    return res.status(400).send({
                        message: 'Register fail',
                        value: false
                    });
                }
                // user.password = undefined;
                // return res.json(user);
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

exports.update_active = function (req, res) {
    User.findOneAndUpdate({email:req.params.email}, req.body, {new: true}, function(err, User) {
        if (err)
            return res.status(400).send({
                response : 'Update fail',
                value: false
            });
        User.password = undefined;
        res.json({
            value: true,
            response: User
        });
    });
}



exports.sign_in = function (req, res) {
    User.findOne({
        email: req.body.email,
    }, function (err, user) {
        if (err) throw err;
        if (!user) {
            res.status(401).json({
                message: 'Authentication failed. User not found.'
            })
        } else if (user) {
            if (user.active_type <1){
                res.status(401).json({
                    message: 'Authentication failed. User not active.'
                })
            } else
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

exports.loginRequired = function (req, res, next) {
    if (req.user) {
        next();
    } else {
        return res.status(401).json({message: 'Unauthorized user!'});
    }
};