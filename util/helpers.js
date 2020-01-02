const parseError = err => {
    if (err.isJoi) return err.details[0];
    return JSON.stringify(err, Object.getOwnPropertyNames(err));
};

const sessionizeUser = user => {
    return { userId: user.id, username: user.username };
}

const sessionizePlayer = player => {
    return { username: player };
}

exports.parseError = parseError;
exports.sessionizeUser = sessionizeUser;
exports.sessionizePlayer = sessionizePlayer;
