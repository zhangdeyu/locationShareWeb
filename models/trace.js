const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Postion = new Schema({
    longitude: String,
    latitude: String
});

const Trace = new Schema({
    username: String,
    postion: [Postion]
});

const traceModel = mongoose.model('Trace', Trace);

module.exports = traceModel;