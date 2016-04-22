Array.prototype.removeByValue = function(value){
	var index = this.indexOf (value);
	if(index!==-1){
		return this.splice(index,1);
	}
	else return null;
}
