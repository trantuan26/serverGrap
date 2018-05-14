'use strict';
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = mongoose.model('User');

exports.register = function(req, res){}

exports.sign_in = function(req, res){}

exports.loginRequired = function(req, res){}