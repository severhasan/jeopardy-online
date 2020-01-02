const Joi = require('@hapi/joi');
const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    title: {
      type: String,
      required: true,
      minlength: 1,
      maxlength: 250
    },
    category: {
        title: {type: String,
            required: true,
            minlength: 1},
        column: Number
    },
    value: Number,
    options: [
        {
            title: {
                type: String,
                required: true,
                minlength: 1,
                maxlength: 250
            },
            answer: Boolean
        },
    ],
    dateCreated: {
        type: Date,
        required: true,
        default: Date.now
    },
    quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' },
    author: {
        id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        username: String
    }
});

const Question = mongoose.model('Question', questionSchema);

function validateQuestion(question) {
    const schema = Joi.object({
        title: Joi.string().min(2).max(250),
        options: Joi.number().min(3).max(4),
        value: Joi.number().required().min(1).max(1000)
    });
    return schema.validate(question);
}

exports.Question = Question;
exports.validateQuestion = validateQuestion;