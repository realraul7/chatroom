var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
var Message = new Schema({
	content:String,
	creator:{
		_id:ObjectId,
		email:String,
		username:String
	},
	_roomId:ObjectId,
	createAt:{
		type:Date,
		default:Date.now
	}

});
module.exports=Message;