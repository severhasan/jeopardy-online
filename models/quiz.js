const Joi = require('@hapi/joi');
const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
    title: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 100,
    },
    tags: [{type: String}],
    dateCreated: {
        type: Date,
        required: true,
        default: Date.now
    },
    author: {
        id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
        username: String
    },
    timesPlayed: {
        type: Number,
        default: 0
    }
});

const Quiz = mongoose.model('Quiz', quizSchema);

function validateQuiz(quiz) {
    const schema = Joi.object({
        title: Joi.string().min(1).max(100),
        author: Joi.object().required()
        });

    return schema.validate(quiz);
}

exports.Quiz = Quiz;
exports.validateQuiz = validateQuiz;