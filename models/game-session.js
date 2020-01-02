const mongoose = require('mongoose');

const gameSessionSchema = {
    path: String,
    pin: String,
    quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' },
    creator: String,
    isLive: Boolean,
    dateCreated: {
        type: Date,
        required: true,
        default: Date.now
    }
}

const gameSession = mongoose.model('game-session', gameSessionSchema);

exports.gameSession = gameSession;