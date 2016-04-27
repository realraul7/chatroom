var db = require('../models');
var async = require('async');
exports.CreateMessage = function(message,callback){
  _message= new db.Message;
  _message.content = message.content;
  _message.creator._id = message.creator._id;
  _message.creator.email = message.creator.email;
  _message.creator.username = message.creator.username;
  _message._roomId = message.roomId;
  _message.save(callback);
};
exports.findMessagesByRoomId = function(roomId, callback){
  db.Message.find({
    _roomId: roomId
  }).sort({ 'createAt': 1 }).exec(callback);
} 