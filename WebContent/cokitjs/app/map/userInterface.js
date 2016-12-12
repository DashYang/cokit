var nodeToEdge = new Object();


function addPOI(preId, placeName, content) {
	var opcnt = localHistoryBuffer.getSize();
	var lastUpdateSRN = remoteHistoryBuffer.getSRN();
	var timestamp = new Timestamp(null, opcnt , me, lastUpdateSRN);
	
	var data = {"placeName" : placeName, "content" : content};
	var identifier = me + ":" + opcnt;
	var node = LinkedListNode.createNewNode(identifier, data, me, timestamp)
	
	//bind call back functions
	node.onCallBackFunction = addPOIBasedOnGoogleMap;
	node.offCallBackFunction = null;
	
	var operation = new RefinedOperation("insert", preId, node);
	var message = new RefinedMessage(operation, timestamp);
	localHistoryBuffer.append(message);
	
	nodeToEdge[identifier] = new Array();
	
	POINodeMap.execute(message);
	
	return identifier;
}

function deletePOI(targetId) {
	var opcnt = localHistoryBuffer.getSize();
	var lastUpdateSRN = remoteHistoryBuffer.getSRN();
	var timestamp = new Timestamp(null, opcnt , me, lastUpdateSRN);
	var operation = new RefinedOperation("delete", targetId, null);
	var message = new RefinedMessage(operation, timestamp);
	localHistoryBuffer.append(message);
	
	POINodeMap.execute(message);
}

function connect(startId, endId, title, content) {
	var opcnt = localHistoryBuffer.getSize();
	var lastUpdateSRN = remotelocalHistoryBuffer.getSRN();
	var timestamp = new Timestamp(null, opcnt , me, lastUpdateSRN);
	
	var startPOITitle = POINodeMap.find(startId).refinedOperation.node.data.placeName;
	var endPOITitle = POINodeMap.find(endId).refinedOperation.node.data.placeName;;
	var data = {"startId" : startId,
				"startPOI": startPOITitle,
				"endId"   : endId,
				"endPOI"  : endPOITitle,
				"title"   : title,
				"content" : content};
	var identifier = me + ":" + opcnt;
	var node = LinkedListNode.createNewNode(identifier, data, me, timestamp)
	
	//bind call back functions
	node.onCallBackFunction = addPOIBasedOnGoogleMap;
	node.offCallBackFunction = null;
	
	var lastInsertNode = EdgeNodeMap.getLastInsertNode();
	var operation = new RefinedOperation("insert", lastInsertNode.identifier, node);
	var message = new RefinedMessage(operation, timestamp);
	localHistoryBuffer.append(message);
	
	nodeToEdge[startId].push(identifier);
	nodeToEdge[endId].push(identifier);
	
	EdgeNodeMap.execute(message);
	
	return identifier;
}

function disconnect(targetId) {
	var opcnt = localHistoryBuffer.getSize();
	var lastUpdateSRN = remotelocalHistoryBuffer.getSRN();
	var timestamp = new Timestamp(null, opcnt , me, lastUpdateSRN);
	var operation = new RefinedOperation("delete", targetId, null);
	var message = new RefinedMessage(operation, timestamp);
	localHistoryBuffer.append(message);
	
	EdgeNodeMap.execute(message);
} 

function update(targetId, title, content) {
	var opcnt = localHistoryBuffer.getSize();
	var lastUpdateSRN = remotelocalHistoryBuffer.getSRN();
	var timestamp = new Timestamp(null, opcnt , me, lastUpdateSRN);
	
	var oldNode = EdgeNodeMap.find(targetId);
	oldNode.data.title = title;
	oldNode.data.content = content; 
	
	var operation = new RefinedOperation("update", targetId, oldNode);
	var message = new RefinedMessage(operation, timestamp);
	localHistoryBuffer.append(message);
	
	EdgeNodeMap.execute(message);
}