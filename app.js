var koa = require('koa');
var json = require('koa-json');
var router = require('koa-router')();
var koaBody = require('koa-body')();
var Promise = require('bluebird');
var mongoose = Promise.promisifyAll(require('mongoose'));

var userModel = require('./models/user.js');
var locationModel = require('./models/location.js');
var traceModel = require('./models/trace.js');

var app = koa();

var config = 'mongodb://localhost:27017/location';
mongoose.connect(config);

// app.use(json());
router
.get('/', function *(next) {
    this.body = 'Hello World!';
})
.post('/user', koaBody, function *(next) {
    var data = this.request.body;
    var user = new userModel({
        id: Date.now(),
        username: data.username
    });
    this.body = yield user.save();
})
.get('/user/:username', function *(next) {
    this.body = yield userModel.findOne({
        username: this.params.username
    }).sort({id: -1});
})
.get('/users', function *(next) {
    var data = yield userModel.find({}).sort({id: -1});
    this.body = {
        "msg": "ok",
        "users": data
    };
})
.post('/location', koaBody, function *(){
    var body = this.request.body;
    var result = yield locationModel.findOne({username: body.username});
    if (result){
        yield locationModel.remove({username: body.username});
    }
    var location = new locationModel({
        id: Date.now(),
        username: body.username,
        longitude: body.longitude,
        latitude: body.latitude,
        flag: body.flag
    });

    //  另存一份数据到 trace
    if (body.flag) {
        var traceResult = yield traceModel.findOne({username: body.username});
        if (traceResult) {
            yield traceModel.update({username: body.username}, {$push: {postion: { longitude: body.longitude, latitude: body.latitude}}}, {safe : true, upsert : true});
        } else {
            var trace = new traceModel({
                username: body.username,
                postion: {
                    longitude: body.longitude,
                    latitude: body.latitude
                }
            });
            yield trace.save();
        }
    }

    this.body = yield location.save();
})
.get('/location/:username', function *(next) {
    this.body = yield locationModel.findOne({
        username: this.params.username,
        flag: true
    }).sort({id: -1});
})
.get('/locations', function *(next) {
    var data = yield locationModel.find({ flag: true }).sort({id: -1});
    this.body = {
        "msg": "ok",
        "locations": data
    };
})
.post('/trace', koaBody, function *(next) {
    var body = this.request.body;

    var result = yield traceModel.findOne({username: body.username});

    if (result) {
        this.body = yield traceModel.update({username: body.username}, {$push: {postion: { longitude: body.longitude, latitude: body.latitude}}}, {safe : true, upsert : true});
    } else {
        var trace = new traceModel({
            username: body.username,
            postion: {
                longitude: body.longitude,
                latitude: body.latitude
            }
        });

        this.body = yield trace.save();
    }
})
.get('/trace/:username', function *(){
    this.body = yield traceModel.findOne({username: this.params.username}).sort({_id: -1});
})
.get('/traces', function *(){
    var data = yield traceModel.find({}).sort({_id: -1});
    this.body = {
        msg: 'ok',
        traces: data
    };
});
app.use(router.routes());
app.listen(80);