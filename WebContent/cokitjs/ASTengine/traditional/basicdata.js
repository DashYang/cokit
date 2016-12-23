function ArrayListNode(message) {
	this.data = message.traditionalOperation.data;
	this.messages = new Array();
	this.identifier = message.timestamp.createIdentifier();
	this.forceDelete = false;

	this.appendMessage = function(message) {
		this.messages.push(message);
	};
	
	this.appendMessage(message);
	this.effectiveness = false;
	
	this.getFirstMessage = function() {
		return this.messages[0];
	};
	
	this.isEffective = function(timestamp, localHistoryBuffer) {
		var effectiveness = false;
		if(this.forceDelete == true) {
            this.effectiveness = false;
            return;
        }
		for(var index in this.messages) {
			var message = this.messages[index]; 
			var type = message.traditionalOperation.type;
			if(!message.timestamp.isHappenedBefore(timestamp, localHistoryBuffer))  //not happened before ignored
				continue;
			switch(type) {
				case "delete":
				case "disconnect":
				case "deletePOI":
                    this.effectiveness = false;
					return false;
				break;
				default:
					effectiveness = true;
			}
		}
		this.effectiveness = effectiveness;
		return effectiveness;
	};
}

ArrayListNode.createNewNode = function(data, user, message) {
	return new ArrayListNode(data, message);
};
//

/**
 * when type == "delete" or "update", index is the position of
 * target,otherwise it's the identifier of logical previous node
 */
function TraditionalOperation(type, index, data) {
	this.type = type;
	this.index = index;
	this.data = data;
	
	this.writeToMessage = function(){
		return {type:this.type, index: this.index, data: this.data};
	};
	
	this.readFromMessage = function(message) {
		this.type = message.type;
		this.index = message.index;
		this.data = message.data;
	};
}


function TraditionalMessage(traditionalOperation, timestamp) {
	this.traditionalOperation = traditionalOperation;
	this.timestamp = timestamp;
	
	this.writeToMessage = function () {
		return {traditionalOperation : this.traditionalOperation.writeToMessage(), timestamp : this.timestamp.writeToMessage()};
	};
	
	this.readFromMessage = function (message) {
		this.traditionalOperation = new TraditionalOperation(message.traditionalOperation.type, message.traditionalOperation.index, 
				message.traditionalOperation.data);
		this.timestamp = new Timestamp(message.timestamp.srn, message.timestamp.opcnt , message.timestamp.user , message.timestamp.lastUpdateSRN);
	};
}

/**
 * arrayList basic operation
 */

function ArrayList(description, owner) {
	this.description = description;
	this.arrayList = new Array();
	this.owner = owner;
	
	//push two nil node as the head and tail node
	var zeroTimestamp = Timestamp.createZeroTimestamp(owner);
	var dummyTraditionalOperation = new TraditionalOperation("dummy",0,"");
	var initMessage = new TraditionalMessage(dummyTraditionalOperation, zeroTimestamp); 
	var nilNode = new ArrayListNode(initMessage);
	this.arrayList.push(nilNode);
	this.arrayList.push(nilNode);
	
	this.find = function(targetIndex) {
		return this.arrayList[targetIndex];
	};
	
	this.insert = function(targetIndex, message) {
		if(targetIndex < 0 || targetIndex >= this.arrayList.length) {
			console.log("out of list's bound!");
			return;
		}
		var newMessage = $.extend(true, {}, message);
		var newNode = new ArrayListNode(newMessage);
		this.arrayList.splice(targetIndex, 0 , newNode);
	};
	
	//delete or update node, delete just fill in the delete timestamp
	this.update = function(targetIndex, message) {
		if(targetIndex < 0 || targetIndex >= this.arrayList.length) {
			console.log("out of list's bound!");
			return;
		}
        var newMessage = $.extend(true, {}, message);
		this.arrayList[targetIndex].appendMessage(newMessage);
	};
	
	this.execute = function(traditionalMessage, localHistoryBuffer, afterTimestamp) {
		var type = traditionalMessage.traditionalOperation.type;
		var timestamp = traditionalMessage.timestamp;
		this.retrace(timestamp, localHistoryBuffer);
		var position = traditionalMessage.traditionalOperation.index;
		var offsetPosition = this.findRealPosition(position);
		var targetIdentifier = this.arrayList[offsetPosition].identifier;
		switch(type) {
			case "insert":
				var realPosition = this.rangeScan(offsetPosition, timestamp, localHistoryBuffer);
				this.insert(realPosition, traditionalMessage);
				break;
			case "delete":
			case "update":
				this.update(offsetPosition, traditionalMessage);
				break;
		}
		//current timestamp
		this.retrace(afterTimestamp, localHistoryBuffer);

		return targetIdentifier;
	};
	
	//call this function after retracing, otherwise it's result is useless
	this.findRealPosition = function (position) {
		var targetIndex = 1;
		for(; targetIndex < this.arrayList.length && position > 0; targetIndex += 1) {
			if(this.arrayList[targetIndex].effectiveness == true) {
				position -= 1;
			}
		}
		return targetIndex;
	};
	
	this.retrace = function(timestamp, localHistoryBuffer) {
		var result = new Array();
		for(var index = 1; index < this.arrayList.length - 1; index ++) {
			var node = this.arrayList[index];
			node.isEffective(timestamp, localHistoryBuffer);
			if(node.effectiveness == true && node.forceDelete == false) {
				var latestData = node.getFirstMessage().traditionalOperation.data;
				var biggestTimestamp = node.getFirstMessage().timestamp;
				for(var messageIndex in node.messages) {
					var curMessage = node.messages[messageIndex];
					var curTimestamp = curMessage.timestamp;
					if(biggestTimestamp.torder(curTimestamp, localHistoryBuffer) && 
							curMessage.traditionalOperation.type != "delete") {
						latestData = curMessage.traditionalOperation.data;
						biggestTimestamp = curTimestamp;
					}
				}
				latestData.identifier = node.identifier;
				result.push(latestData);
			}
		}
//		console.log(JSON.stringify(timestamp) + " " + JSON.stringify(result));
		return result;
	};
	
	
	this.rangeScan = function(realPosition, timestamp, localHistoryBuffer) {
		var targetIndex = null;
		for(var index = realPosition ; index < this.arrayList.length; index ++) {
			var firstMessage = this.arrayList[index].getFirstMessage();
			var birth = firstMessage.timestamp;
			if(!birth.isHappenedBefore(timestamp, localHistoryBuffer) && !timestamp.isHappenedBefore(birth,
					localHistoryBuffer)) {  //concurrent
				if(timestamp.torder(birth, localHistoryBuffer) == true && targetIndex == null) {
					targetIndex = index;
				} 
				
				if(timestamp.torder(birth, localHistoryBuffer) == false && targetIndex != null &&
						birth.isHappenedBefore(this.arrayList[targetIndex].getFirstMessage().timestamp, 
								localHistoryBuffer)) {
					targetIndex = null;
				} 
			}
			
			if(birth.isHappenedBefore(timestamp, localHistoryBuffer)) {
				if(targetIndex == null) {
					targetIndex = index;
				}
				break;
			}
		}
		
		if(targetIndex == null) {
			return this.arrayList.length - 1;
		} else {
			return targetIndex;
		}
	};
	
	//call this function after retracing, otherwise it's result is useless
	this.getEffectiveNodeList = function(localHistoryBuffer) {
		var result = new Array();
		for(var index = 1; index < this.arrayList.length - 1; index ++) {
			var node = this.arrayList[index];
			if(node.effectiveness == true && node.forceDelete == false) {
				var latestData = node.getFirstMessage().traditionalOperation.data;
				var biggestTimestamp = node.getFirstMessage().timestamp;
				for(var messageIndex in node.messages) {
					var curMessage = node.messages[messageIndex];
					var curTimestamp = curMessage.timestamp;
					if(biggestTimestamp.torder(curTimestamp, localHistoryBuffer) && 
							curMessage.traditionalOperation.type != "delete") {
						latestData = curMessage.traditionalOperation.data;
						biggestTimestamp = curTimestamp;
					}
				}
				latestData.identifier = node.identifier;
				result.push(latestData);
			}
		}
		return result;
	};
}