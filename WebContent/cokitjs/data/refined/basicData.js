/**
 * 
 * @param identifier
 *            find node via identifier
 * @param data
 *            customized information
 * @param nextId
 *            next node's id
 * @param insertTimestamp
 * @param deleteTimestamp
 * @param updateTimestamp
 * @returns
 */
function LinkedListNode(identifier, data, nextId, insertTimestamp,
		deleteTimestamp, updateTimestamp) {
	this.identifier = identifier;
	this.data = data;
	this.nextId = nextId;
	this.insertTimestamp = insertTimestamp;
	this.deleteTimestamp = deleteTimestamp;
	this.updateTimestamp = updateTimestamp;
	this.isEffective = false;
	
	this.onCallBackFunction = null;
	this.offCallBackFunction = null;
	this.on = function() {
		this.isEffective = true;
		// to do: call back function
		if(this.onCallBackFunction != null)
			this.onCallBackFunction(this);
	};

	this.off = function() {
		this.isEffective = false;
		// to do: call back function
		if(this.onCallBackFunction != null)
			this.offCallBackFunction(this);
	};
}

LinkedListNode.createNewNode = function(identifier, data, user, timestamp) {
	var zeroTS = Timestamp.createZeroTimestamp(me);
	var infiTS = Timestamp.createInfiniteTimestamp(me);
	return new LinkedListNode(identifier, data, null, timestamp, infiTS, zeroTS);
};

/**
 * when type == "delete" or "update", targetId is the identifier of
 * target,otherwise it's the identifier of logical previous node
 */
function RefinedOperation(type, targetId, data) {
	this.type = type;
	this.targetId = targetId;
	this.data = data;
	
	this.writeToMessage = function(){
		return {type:this.type, targetId: this.targetId, data: this.data};
	};
	
	this.readFromMessage = function(message) {
		this.type = message.type;
		this.targetId = message.targetId;
		this.data = message.data;
	};
}

/**
 * refinedOperation.targetId, refinedOperation.type and timestamp can't be null
 */
function RefinedMessage(refinedOperation, timestamp) {
	this.refinedOperation = refinedOperation;
	this.timestamp = timestamp;
	
	this.createLinkedListNodeFromMessage = function() {
		var identifier = this.timestamp.createIdentifier();
		var data =  this.refinedOperation.data;
		var infiTS = Timestamp.createInfiniteTimestamp(this.timestamp.user);
		return new  LinkedListNode(identifier, data, null, this.timestamp,
				infiTS, this.timestamp);
	};
	
	this.writeToMessage = function(){
		return {refinedOperation: this.refinedOperation.writeToMessage(), timestamp: this.timestamp.writeToMessage()};
	};
	
	this.readFromMessage = function(message) {
		this.refinedOperation = new RefinedOperation(message.refinedOperation.type, message.refinedOperation.targetId,
				message.refinedOperation.data);
		this.timestamp = new Timestamp(message.timestamp.srn, message.timestamp.opcnt , message.timestamp.user , message.timestamp.lastUpdateSRN);
	};
}

/**
 * nodeMap's basic operation
 */
function NodeMap(description, me) {
	this.description = description;
	this.owner = me;
	this.map = new Object();
	this.lastInsertNode = null;

	var zeroTimestamp = Timestamp.createZeroTimestamp(me);
	this.headNode = new LinkedListNode(0, null, 1, zeroTimestamp, zeroTimestamp,
			zeroTimestamp);
	this.tailNode = new LinkedListNode(1, null, 2, zeroTimestamp, zeroTimestamp,
			zeroTimestamp);

	this.map[this.headNode.identifier] = this.headNode;
	this.map[this.tailNode.identifier] = this.tailNode;
	

	this.find = function(targetId) {
		return this.map[targetId];
	};

	this.getLastInsertNode = function() {
		return this.lastInsertNode;
	};
	
	this.getHeadNode = function () {
		return this.headNode;
	};
	
	this.getTailNode = function () {
		return this.tailNode;
	};

	this.insert = function(preId, node) {
		var preNode = this.find(preId);
		if (preNode == null) {
			console.log("can't find " + preId + " in local replca! ignore");
			return;
		}
		if (this.find(node.identifier) != null) {
			console.log(node.identifier
					+ " already exists in local replica! ignore");
			return;
		}
		node.nextId = preNode.nextId;
		preNode.nextId = node.identifier;
		this.map[node.identifier] = node;
		lastInsertNode = node;
	};

	// delete or update node, delete just fill in the delete timestamp
	this.update = function(targetId, node) {
		preNode = find(targetId);
		if (preNode == null) {
			console.log("can't find " + preId + " in local replica! ignore");
			return;
		}
		this.map[targetId] = node;
	};

	// bind specify range scan algorithm
	this.rangeScan = traditionalRangeScan;

	this.execute = function(refinedMessage, localHistoryBuffer)
	{
		var targetId = refinedMessage.refinedOperation.targetId;
		var timestamp = refinedMessage.timestamp;
		var type = refinedMessage.refinedOperation.type;
		switch (type) {
		case "insert":
			var realPrevious = this.rangeScan(this, targetId, timestamp, localHistoryBuffer);
			var newNode = refinedMessage.createLinkedListNodeFromMessage();
			this.insert(realPrevious, newNode); // automatically fill in the
			newNode.on();
			break;
		case "delete":
			var targetNode = this.find(targetId);
			if (timestamp.torder(targetNode.deleteTimestamp, localHistoryBuffer) == true) {
				targetNode.deleteTimestamp = timestamp;
				this.update(targetId, targetNode);
			}
			targetNode.off();
			break;
		case "update":
			var targetNode = this.find(targetId);
			var newNode = refinedMessage.createLinkedListNodeFromMessage();
			if (targetNode.updateTimestamp.torder(timestamp, localHistoryBuffer) == true) {
				targetNode.updateTimestamp = timestamp;
				targetNode.data = newNode.data;
				this.update(targetId, targetNode);
			}
			break;
		// todo defined your customized operation
			
		default:
			console.log("unrecognized type");
			break;
		}
	};
	
	this.getEffectiveNodeList = function() {
		var currNode = this.getHeadNode();
		var tailNode = this.getTailNode();
		currNode = this.find(currNode.nextId);
		var result = new Array();
		while (currNode != tailNode) {
			if(currNode.isEffective == false) {
				currNode = this.find(currNode.nextId);
				continue;
			}
			result.push(currNode);
			currNode = this.find(currNode.nextId);
		}
		return result;
	};
};

/**
 * two weird operation could happened or not?
 * 
 * @param nodeMap
 * @param targetId
 * @param ts
 * @returns
 */
function traditionalRangeScan(nodeMap, targetId, ts, localHistoryBuffer) {
	var nextId = nodeMap.map[targetId].nextId;
	var realPreviousId = null;
	
	previousId = targetId;
	var current = nodeMap.map[nextId];
	currentTS = current.insertTimestamp;
	while (!currentTS.isHappenedBefore(ts, localHistoryBuffer)) { //
		if ( ts.isHappenedBefore(currentTS, localHistoryBuffer) == true ) {
			console.log("weired operation??? current timestampe:" + currentTS
					+ " insert timestamp:" + ts);
		}
		if ( ts.torder(currentTS, localHistoryBuffer) && realPreviousId == null) {
			realPreviousId = previousId;
		}
		if ( currentTS.torder(ts, localHistoryBuffer)
				&& realPreviousId != null
				&& !currentTS.isHappenedBefore(
						nodeMap.map[realPreviousId].insertTimestamp, localHistoryBuffer)) {
			console.log("weired operation??? current timestampe:" + currentTS
					+ " realPrevious timestamp:"
					+ nodeMap.map[realPreviousId].insertTimestamp);
		}
		if ( currentTS.torder(ts, localHistoryBuffer)
				&& realPreviousId != null
				&& currentTS.isHappenedBefore(nodeMap.map[realPreviousId].insertTimestamp,localHistoryBuffer)) {
			realPreviousId = null;
		}
		previousId = current.identifier;
		current = nodeMap.map[current.nextId];
		currentTS = current.insertTimestamp;
	}
	if (realPreviousId == null)
		return previousId;
	else
		return realPreviousId;
}

function refinedRangeScan(nodeMap, targetId, ts) {
	var nextId = nodeMap.map[targetId].nextId;
	var realPreviousId = null;
	previousId = targetId;
	var current = nodeMap.map[nextId];
	currentTS = current.insertTimestamp;
	while (!isHappenedBefore(currentTS, ts)) {
		if (torder(ts, currentTS) && realPreviousId == null) {
			realPreviousId = previousId;
		}
		if (torder(currentTS, ts) && realPreviousId != null) {
			realPreviousId = null;
		}
		previousId = current.identifier;
		current = nodeMap.map[current.nextId];
		currentTS = current.insertTimestamp;
	}
	if (realPreviousId == null)
		return previousId;
	else
		return realPreviousId;
}