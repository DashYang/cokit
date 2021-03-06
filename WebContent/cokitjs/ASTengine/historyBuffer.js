function HistoryBuffer(owner) {
	this.list = new Array(); // 
	this.maxSRN = -1;
	this.owner = owner;
	this.tail = 0;
	// push

	this.append = function(message) {
		this.list.push(message);
	};
	
	this.acknowledge = function(message) {
		var timestamp = message.timestamp;
		var opcnt = timestamp.opcnt;
		var srn = timestamp.srn;
		//fetch local records from server(it is owner's message but local history doesnt't have, it has srn)
		if(this.list[opcnt] == null) {
			this.append(message);
		}
		this.list[opcnt].timestamp.srn = srn;
	};
	
	/**
	 * use these function to handle all messages(local message, acknowledge message, remote message) 
	 */
	this.push = function(message) {
		if (message == null)
			return;
		var srn = message.timestamp.srn;
		var user = message.timestamp.user;
		if (user == this.owner) { // owner's operation
			if (srn == null) {   //first create
				this.append(message);
			} else {             //ack
				this.acknowledge(message);
			}
		} else {   // other user's operation. always contains srn
			this.append(message);
		}
		if ( srn != null && srn > this.maxSRN)
			this.maxSRN = srn;
		// console.log(this.name + " push " + JSON.stringify(data));
	};

	this.get = function(index) {
		if (index < this.list.length)
			return this.list[index];
		return null;
	};

	this.getSRN = function() {
		return this.maxSRN;
	};
	
	this.getSize = function() {
		return this.list.length;
	};
}




