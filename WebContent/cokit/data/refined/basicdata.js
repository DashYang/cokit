/**
 * 
 * @param identifier  		find node via identifier
 * @param data 		  		customized information
 * @param nextId 	  		next node's id
 * @param insertTimestamp 
 * @param deleteTimestamp
 * @param updateTimestamp
 * @returns
 */
function LinkedListNode(identifier, data, nextId, insertTimestamp, deleteTimestamp, updateTimestamp) {
	this.identifier = identifier;
	this.data = data;
	this.nextId = nextId;
	this.insertTimestamp = insertTimestamp;
	this.deleteTimestamp = deleteTimestamp;
	this.updateTimestamp = updateTimestamp;
}


/** when type == "delete" or "update", targetId is the identifier of target,otherwise it's the identifier of
*   logical previous node
**/
function refinedMessage(type, targetId, data, timestamp) {
	this.type = type;
	this.targetId = targetId;
	this.data = data;
	this.timestamp = timestamp;
}

/**
 * nodeMap's basic operation
 */
//head and tail node for nodeMap
headNode = new LinkedListNode(0, null, 1, initTimestamp, initTimestamp, initTimestamp);
tailNode = new LinkedListNode(1, null, 2, initTimestamp, initTimestamp, initTimestamp);
function nodeMap(description) {
	this.description = description;
	this.map = new Object();
	map[headNode.identifier] = headNode;
	map[tailNode.identifier] = tailNode;
	
	this.find = function(targetId) {
		return map[target];
	}
	
	this.insert = function(preId, node) {
		preNode = find(preId);
		if(preNode == null) {
			console.log("can't find " + preId + " in local replca! ignore"); 
			return;
		}
		if(find(node.identifier) != null) {
			console.log(node.identifier + " already exists in local replca! ignore"); 
			return;
		}
		node.nextId = preNode.nextId;
		map[node.identifier] = node;
	};
	
	//delete or update node, delete just fill in the delete timestamp
	this.update = function(targetId, node) {
		preNode = find(targetId);
		if(preNode == null) {
			console.log("can't find " + preId + " in local replca! ignore"); 
			return;
		}
		map[targetId] = node;
	};
};

function torder(ts1, ts2) {
	console.log(ts1.opcnt + ts1.user);
	console.log(ts2.opcnt + ts2.user);
	return (ts1.opcnt + ts1.user) < (ts2.opcnt + ts2.user);
}

function rangeScan(nodeMap, targetId, ts) {
	var nextId = nodeMap.map[targetId].nextId;
	var realPreviousId = "-1";
	previousId = targetId;
	var current = nodeMap.map[nextId];
	currentTS = current.insertTimestamp;
	while(isConcurrent(currentTS,ts) || 
			!isHappenedBefore(currentSV,sv)) {
		if(torder(sv,currentSV) && realPreviousId == "-1") {
			realPreviousId = previousId;
		}
		if(torder(currentSV,sv) && realPreviousId != -1 && isHappenedBefore(currentSV,
				itineraryGraph[realPreviousId].userInfoList[targetUser].birth)) {
			realPreviousId = "-1";
		}
		previousId = current.identifier;
		current = itineraryGraph[current.userInfoList[targetUser].nextId];
		currentSV = current.userInfoList[targetUser].birth;
	}
	if(realPreviousId == -1)
		return previousId;
	else
		return realPreviousId;
}