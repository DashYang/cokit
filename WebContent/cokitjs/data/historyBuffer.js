function HistoryBuffer() {
	this.list = new Array(); // 队列数据
	this.maxSRN = -1;
	// push

	this.append = function(message) {
		this.list.push(message);
	}
	
	this.acknowledge = function(timestamp) {
		var opcnt = timestamp.opcnt;
		var srn = timestamp.srn;
		this.list[opcnt] = srn;
	}
	this.push = function(message) {
		if (message == null)
			return;
		var srn = message.timestamp.srn;
		var user = message.timestamp.user;
		if (user == me) { // owner's operation
			if (srn == null) {   //first create
				append(message);
			} else {             //ack
				acknowledge(message.timestamp);
			}
		} else {   // other user's operation. always contains srn
			append(message);
		}
		this.list.push(data);
		if ( srn != null && srn > this.maxSRN)
			this.maxSRN = srn;
		// console.log(this.name + " push " + JSON.stringify(data));
	};

	this.get = function(index) {
		if (index < tail)
			return this.list[index];
		return null;
	}

	this.getSRN = function() {
		return this.maxSRN;
	}
	
	this.getSize = function() {
		return this.list.length;
	}
}




