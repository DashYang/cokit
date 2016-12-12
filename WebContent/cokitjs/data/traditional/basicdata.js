function ArrayListNode(data, insertTimestamp, deleteTimestamp, updateTimestamp) {
	this.data = data;
	this.insertTimestamp = insertTimestamp;
	this.deleteTimestamp = deleteTimestamp;
	this.updateTimestamp = updateTimestamp;
}

//
function traditionalMessage(type, position, data, timestamp) {
	this.type = type;
	this.position = position;
	this.data = data;
	this.timestamp = timestamp;
}

/**
 * arrayList basic operation
 */

nilNode = new ArrayListNode(null,initTimestamp, initTimestamp, initTimestamp);

function arrayList(description) {
	this.description = description;
	this.arrayList = new Array();
	
	//push two nil node as the head and tail node
	arrayList.push(nilNode);
	arrayList.push(nilNode);
	this.find = function(targetIndex) {
		return arrayList[targetIndex];
	}
	
	this.insert = function(targetIndex, node) {
		arrayList.splice(targetIndex, 0 , node);
	};
	
	//delete or update node, delete just fill in the delete timestamp
	this.update = function(targetId, node) {
		arrayList[targetIndex] = node;
	};
}