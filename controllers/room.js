var db = require('../models');
var async = require('async');
exports.findUserById = function(_userId,callback){
	db.User.findOne({_id:_userId},callback);
};
exports.CreateRoom = function(name,callback){
	room= new db.Room;
	room.name = name;
	room.save(callback);
};
exports.findRoomByName = function(name,callback){
	db.Room.find({name:new RegExp('\w*'+name+'\w*')}).sort({'_id':-1}).exec(callback);
};
exports.findAllRoom = function(callback){
	db.Room.find({},callback);
}
