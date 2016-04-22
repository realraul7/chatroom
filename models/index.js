var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/chatroom');
exports.User = mongoose.model('User',require('./User'));
exports.Room = mongoose.model('Room',require('./room'));
exports.Message = mongoose.model('Message',require('./message'));