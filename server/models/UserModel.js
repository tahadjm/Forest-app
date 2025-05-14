import pkg from 'joi';

import mongoose from "mongoose";
const { Schema, model } = mongoose;

const UserSchema = Schema({
    email: {
        type: String,
        required: [true, 'fill in this field'],
        trim: true,
        unique: [true, 'this email already exists in the database'],
        minLength: [5, 'email must have at least 5 characters'],
        lowercase: true,
    },
    username: {
        type: String,
        unique: [true, 'this username already exists in the database'],
        minLength: [5, 'username must have at least 5 characters'],
        lowercase: true,
    },
    password: {
        type: String,
        required: [true, 'fill in this field'],
        minLength: [12, 'password must have at least 12 characters'],
        trim: true,
        select: false,
    },
    verified: {
        type: Boolean,
        default: false
    },
    verificationcode: {
        type: String,
        default: false
    },

    verificationcodevalidation: {
        type: Number,
        default: false
    },
    forgetpasswordcode: {
        type: String,
        default: false
    },
    forgetpasswordcodevalidation: {
        type: Number,
        default: false
    },
    chargilyCustomerId: {
        type: String,
    },
    role: {
        type: String,
        enum: ['user', 'sous admin', 'admin'], // Added 'sous admin'
        default: 'user' // Default role is 'user'
    },
    parkId: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Park',
        required: function () { return this.role === 'sous admin'; }, // Required only if role is 'sous admin'
    },
    googleId: {
        type: String,
        default: null,
    },
    Subscribed: {
        type: Boolean,
        default: false
    },
}, {
    timestamps: true
});

export default model("User", UserSchema);