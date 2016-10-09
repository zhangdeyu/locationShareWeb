const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Location = new Schema({
    id: String,
    username: String,
    longitude: String,
    latitude: String,
    flag: Boolean
});

const locationModel = mongoose.model('Location', Location);

module.exports = locationModel;