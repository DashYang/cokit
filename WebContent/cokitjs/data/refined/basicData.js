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
		isEffective = true;
		// to do: call back function
		if(this.onCallBackFunction != null)
			onCallBackFunction(this);
	}

	this.off = function() {
		isEffective = false;
		// to do: call back function
		if(this.onCallBackFunction != null)
			offCallBackFunction(this);
	}
}

LinkedListNode.createNewNode = function(identifier, data, me, timestamp) {
	var zeroTS = Timestamp.createZeroTimestamp(me);
	var infiTS = imestamp.createInfiniteTimestamp(me);
	return LinkedListNode(identifier, data, null, timestamp, infiTS, zeroTS)
};

/**
 * when type == "delete" or "update", targetId is the identifier of
 * target,otherwise it's the identifier of logical previous node
 */
function RefinedOperation(type, targetId, node) {
	this.type = type;
	this.targetId = targetId;
	this.node = node;
}

/**
 * refinedOperation.targetId, refinedOperation.type and timestamp can't be null
 */
function RefinedMessage(refinedOperation, timestamp) {
	this.refinedOperation = refinedOperation;
	this.timestamp = timestamp;
}

/**
 * nodeMap's basic operation
 */
// head and tail node for nodeMap
function NodeMap(description, me) {
	this.description = description;
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
		return map[target];
	}

	this.getLastInsertNode = function() {
		return lastInsertNode;
	}
	
	this.getHeadNode = function () {
		return headNode;
	}
	
	this.getTailNode = function () {
		return tailNode;
	}

	this.insert = function(preId, node) {
		preNode = find(preId);
		if (preNode == null) {
			console.log("can't find " + preId + " in local replca! ignore");
			return;
		}
		if (find(node.identifier) != null) {
			console.log(node.identifier
					+ " already exists in local replca! ignore");
			return;
		}
		node.nextId = preNode.nextId;
		this.map[node.identifier] = node;
		lastInsertNode = node;
	};

	// delete or update node, delete just fill in the delete timestamp
	this.update = function(targetId, node) {
		preNode = find(targetId);
		if (preNode == null) {
			console.log("can't find " + preId + " in local replca! ignore");
			return;
		}
		map[targetId] = node;
	};

	// bind specify range scan algorithm
	this.rangeScan = traditionalRangeScan;

	this.execute = function(refinedMessage)
	{
		var targetId = refinedMessage.refinedOperation.targetId;
		var timestamp = refinedMessage.timestamp;
		var type = refinedMessage.refinedOperation.type;
		switch (type) {
		case "insert":
			var realPrevious = rangeScan(this, targetId, timestamp);
			var identifier = timestamp.createIdentifier();
			var data = refinedMessage.refinedOperation.data;
			var zeroTimestamp = Timestamp.createZeroTimestamp(timestamp.user);
			var infiniteTimestamp = Timestamp
					.createInfiniteTimestamp(timestamp.user);
			newNode = new LinkedListNode(identifier, data, null, zeroTimestamp,
					infiniteTimestamp, zeroTimestamp);
			newNode.on();
			insert(realPrevious, newNode); // automatically fill in the
			// nextId
			break;
		case "delete":
			var targetNode = find(targetId);
			if (timetamp.torder(targetNode) == true) {
				targetNode.deleteTimestamp = timestamp;
				update(targetId, targetNode);
			}
			targetNode.off();
			break;
		case "update":
			var targetNode = find(targetId);
			if (timetamp.torder(targetNode) == true) {
				targetNode.deleteTimestamp = timestamp;
				update(targetId, targetNode);
			}
			targetNode.off();
			break;
		// todo defined your customized operation
		default:
			console.log("unrecognized type")
			break;
		}
	}
};

function torder(ts1, ts2) {
	console.log(ts1.opcnt + ts1.user);
	console.log(ts2.opcnt + ts2.user);
	return (ts1.opcnt + ts1.user) < (ts2.opcnt + ts2.user);
}

/**
 * two weird operation could happened or not?
 * 
 * @param nodeMap
 * @param targetId
 * @param ts
 * @returns
 */
function traditionalRangeScan(nodeMap, targetId, ts) {
	var nextId = nodeMap.map[targetId].nextId;
	var realPreviousId = null;
	previousId = targetId;
	var current = nodeMap.map[nextId];
	currentTS = current.insertTimestamp;
	while (!isHappenedBefore(currentTS, ts)) { //
		if (isHappenedBefore(ts, currentTS) == true) {
			console.log("weired operation??? current timestampe:" + currentTS
					+ " insert timestamp:" + ts);
		}
		if (torder(ts, currentTS) && realPreviousId == null) {
			realPreviousId = previousId;
		}
		if (torder(currentTS, ts)
				&& realPreviousId != null
				&& !isHappenedBefore(currentTS,
						nodeMap.map[realPreviousId].insertTimestamp)) {
			console.log("weired operation??? current timestampe:" + currentTS
					+ " realPrevious timestamp:"
					+ nodeMap.map[realPreviousId].insertTimestamp);
		}
		if (torder(currentTS, ts)
				&& realPreviousId != null
				&& isHappenedBefore(currentTS,
						nodeMap.map[realPreviousId].insertTimestamp)) {
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