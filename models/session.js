const Joi = require('@hapi/joi');
const mongoose = require('mongoose');

const mongoSchema = new mongoose.Schema({
    username: String,
    date: {
        type: Date,
        default: Date.now,
        expires: 36000
    }
});

module.exports = mongoose.model('MongoSession', mongoSchema);

// expireAt: {
//     type: Date,
//     default: Date.now,
//     index: { expires: '5m' },
//   },