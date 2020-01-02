const mongoose = require('mongoose');
require('dotenv').config()

const options = {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
};


module.exports = function(){
    mongoose.connect(process.env.DB_LINK, options)
        .then(() => console.log('Connected to MongoDB...'))
}