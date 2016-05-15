var db = require('../models');
var async = require('async');
var gravatar = require('gravatar');
exports.findUserById = function(_userId, callback){
	db.User.findOne({_id:_userId},callback);
};
exports.CreateUser = function(_email, _userName, _pwd, callback){
	db.User.findOne({username:_userName},function(err,data){
		if(err) {
			callback(err,data);
		} else if (data) {
			callback(err,{message:'用户名已经被注册'});
		} else {
				db.User.findOne({email:_email},function(err,data){
					if(err) {
						callback(err,data);
					} else if (data) {
						callback(err,{message:'邮箱已经被注册'});
					} else {				
						user= new db.User;
						user.email = _email;
						user.username = _userName;
						user.password = _pwd;
						user.gravatar='123';
						user.save(callback);
					}
				});
		}
	});

};
exports.CheckLogin = function(_account, callback){
	db.User.findOne({username:_account},function(err,data) {
		if(err) {
			callback(err,data);
		}
		if(!data) {
			db.User.findOne({email:_account},callback);
		} else {
			callback(err, data);
		}
	});
};
exports.UserEnterRoom = function(userId, roomId, callback){
	db.User.update({_id:userId},{_roomId:roomId},{},callback)
};
exports.UserGetOutFromRoom = function(userId, callback){
	db.User.update({_id:userId},{_roomId:undefined},{},callback)
};
exports.getOnlineUser = function(roomId, callback){
	db.User.find({_roomId:roomId},callback);
}
exports.getUserInfo = function(userId, callback) {
	db.User.find({_id:userId}, callback)
}
exports.updateUser = function(userId, obj, callback) {
	db.User.update({_id:userId},obj,{},callback);
}