var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
var User = new Schema({
	email:String,
	username:{unique:true,type:String},
	avataUrl:String,
	password:String,
	_roomId:ObjectId
});
module.exports=User;

//username : {unique:true,type:String}