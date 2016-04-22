var db = require('../models');
var async = require('async');
var gravatar = require('gravatar');
exports.findUserById = function(_userId,callback){
	db.User.findOne({_id:_userId},callback);
};
exports.CreateUser = function(_email,_userName,_pwd,callback){
	user= new db.User;
	user.email = _email;
	user.username = _userName;
	user.password = _pwd;
	user.gravatar='123';
	user.save(callback);
};
exports.CheckLogin = function(_account,callback){
	db.User.findOne({username:_account},callback);
};
exports.UserEnterRoom = function(userId,roomId,callback){
	db.User.update({_id:userId},{_roomId:roomId},{},callback)
};
exports.UserGetOutFromRoom = function(userId,callback){
	db.User.update({_id:userId},{_roomId:undefined},{},callback)
};
exports.getOnlineUser = function(roomId,callback){
	db.User.find({_roomId:roomId},callback);
}
