var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
var User = new Schema({
	email:String,
	username:{unique:true,type:String},
	avataUrl:String,
	password:String,
	_roomId:ObjectId,
  sign:String,
  phone:{type:Number, default:0},
  age:{type:Number, default:0},
  sex:{type:Number, default:0}, // 1 男 2 女
  address:String 
});
module.exports=User;

//username : {unique:true,type:String}