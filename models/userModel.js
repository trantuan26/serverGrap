'use strict';
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    first_name:{
        type:String,
        trim:true,
        required:true
    },
    last_name:{
        type:String,
        trim:true,
        required:true
    },
    phone_number:{
        type:String
    },
    email:{
        type:String,
        trim:true,
        required:true,
        unique:true,
        lowercase: true
    },
    password:{
        type:String,
        required:true
    },
    active_type:{
        type:Number,
        default:0
    },
    avatar_link:{
        type:String
    },
    create_at:{
        type: Date,
        default:Date.now
    }
});


UserSchema.methods.comparePassword = function (password) {
    return bcrypt.compareSync(password, this.password);
}

mongoose.model('User',UserSchema);