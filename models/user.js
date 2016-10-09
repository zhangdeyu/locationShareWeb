const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const User = new Schema({
    id: String,
    username: String
});

const userModel = mongoose.model('User', User);

module.exports = userModel;