const Joi = require('@hapi/joi');
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
      type: String,
      required: false,
      minlength: 2,
      maxlength: 50,
    },
    username: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 25
    },
    email: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 255,
        unique: true,
    },
    password: {
        type: String,
        required: true,
        minlength: 8,
        maxlength: 1024
    },
    roles: [
        {isAdmin: Boolean, default: false},
        {isInstructor: Boolean, default: false},
        {isStudent: Boolean, default: false}
    ],
    dateJoined: {
        type: Date,
        required: true,
        default: Date.now
    }
});

// userSchema.methods.generateAuthToken = function() {
//     const token = jwt.sign({_id: this._id, isAdmin: this.isAdmin}, process.env.JWTPrivateKey);
//     return token;
// }
  
const User = mongoose.model('User', userSchema);

function validateUser(user) {
    const schema = Joi.object({
        username: Joi.string().min(2).max(25),
        name: Joi.string().min(2).max(50),
        email: Joi.string().min(5).max(255).required().email(),
        password: Joi.string().min(8).max(255).required()
        });

    return schema.validate(user);
}

exports.User = User;
exports.validateUser = validateUser;