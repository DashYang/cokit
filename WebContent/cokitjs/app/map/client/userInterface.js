/**
 * parameters from web applications
 */
//to denote who I am, necessary! default me is an uuid
var me = getUrlParam("user");
var cokey = "itineraryplanning-clientpull";

var sender = new HttpSender("cokit", "HttpServer", cokey, null, onMessage, null);

var sharedWorkSpace = new itineraryPlanningWorkSpace();
var itineraryplanningService = new ItineraryPlanningService(me, sender, sharedWorkSpace);

// fetch messages after 1s
setInterval(fetchMessages, 1000);
var fetchFlag = false;
function fetchMessages() {
	if(fetchFlag == true)
		return;
	var timestamp = itineraryplanningService.createLocalTimestamp();
	var message = new RefinedMessage(null, timestamp);
	message = message.writeToMessage();
	sender.synchronizeMessages(message);
	fetchFlag = true;
}

function onOpen() {
	console.log("open");
}

function onMessage(jsonMessage) {
	fetchFlag = false;
	
	if(jsonMessage.state != "ok")
		return;
	
	if(jsonMessage.type == "SYNCHRONIZATION") {
		if(jsonMessage.size == 0)
			return;
		var items = jsonMessage.result;
		for(var index in items) {
			var cleanmessage = items[index];
			var message = new RefinedMessage(null,null);
			message.readFromMessage(cleanmessage);
			itineraryplanningService.receiveMessage(message);
		}
		itineraryplanningService.run();
		fetchFlag = false;
		bindPOIClickEvent();
		bindEdgeClickEvent();
	} else if (jsonMessage.type == "EXPERIMENTRESULT") {
		
	}
}

//init the app
itineraryplanningService.initWorkSpace();
bindPOIClickEvent();
bindEdgeClickEvent();

var nodeToEdge = new Object();
function addPOI(preId, placeName, content) {
	//create message
	var timestamp = itineraryplanningService.createLocalTimestamp();
	var data = new POIData(placeName, content);
	var operation = new RefinedOperation("addPOI", preId, data.getData());
	var message = new RefinedMessage(operation, timestamp);
	
	itineraryplanningService.receiveMessage(message);
	itineraryplanningService.run();
	
	bindPOIClickEvent();
	bindEdgeClickEvent();
}

function deletePOI(targetId) {
	//create message
	var timestamp = itineraryplanningService.createLocalTimestamp();
	var operation = new RefinedOperation("deletePOI", targetId, null);
	var message = new RefinedMessage(operation, timestamp);
	
	itineraryplanningService.receiveMessage(message);
	itineraryplanningService.run();
	
	bindPOIClickEvent();
	bindEdgeClickEvent();
}

function connect(targetId, startId, endId, title, content) {
	//create message
	var timestamp = itineraryplanningService.createLocalTimestamp();
	var startPOITitle = itineraryplanningService.POINodeMap.find(startId).data.placeName;
	var endPOITitle = itineraryplanningService.POINodeMap.find(endId).data.placeName;;
	var data = new EdgeData(startId, startPOITitle, endId, endPOITitle, title, content);
	
	var operation = new RefinedOperation("connect", targetId, data.getData());
	var message = new RefinedMessage(operation, timestamp);
	
	itineraryplanningService.receiveMessage(message);
	itineraryplanningService.run();
	
	bindPOIClickEvent();
	bindEdgeClickEvent();
	
}

function disconnect(targetId) {
	//create message
	var timestamp = itineraryplanningService.createLocalTimestamp();
	var operation = new RefinedOperation("disconnect", targetId, null);
	var message = new RefinedMessage(operation, timestamp);

	itineraryplanningService.receiveMessage(message);
	itineraryplanningService.run();
	
	bindPOIClickEvent();
	bindEdgeClickEvent();
} 


function updateMessageFromNodeMap(type, nodeMap, targetId, content) {
	//create message
	var timestamp = itineraryplanningService.createLocalTimestamp();
	
	var oldNode = nodeMap.find(targetId);
	oldNode.data.content = content; 
	
	var operation = new RefinedOperation(type, targetId, oldNode.data);
	var message = new RefinedMessage(operation, timestamp);
	return message;
}
function updatePOI(targetId, content) {
	var message = updateMessageFromNodeMap("updatePOI", itineraryplanningService.POINodeMap, targetId, content);
	
	itineraryplanningService.receiveMessage(message);
	itineraryplanningService.run();
	
	bindPOIClickEvent();
	bindEdgeClickEvent();
}

function updateEdge(targetId, title, content) {
	var message = updateMessageFromNodeMap("updateEdge", itineraryplanningService.EdgeNodeMap, targetId, content);
	
	itineraryplanningService.receiveMessage(message);
	itineraryplanningService.run();
	
	bindPOIClickEvent();
	bindEdgeClickEvent();
}


/**
 * GUI:manage all click event
 */
function bindPOIClickEvent() {
	//bind click event of every button
	$(".insertPOIbutton").click(function(e) {
		var preId = $(this).attr("id").substr(1);
		var content = $("#POIcontent").val();
		var placeName = $("#POItitle").val();
		if(placeName != null) {
			addPOI(preId, placeName, content);
		}
	});
	
	$(".deletePOIbutton").click(function(e) {
		var targetId = $(this).attr("id").substr(1);
		deletePOI(targetId);
	});
	
	$(".updatePOIbutton").click(function(e) {
		var targetId = $(this).attr("id").substr(1);
		var content = $("#POIcontent").val();
		updatePOI(targetId, content);
	});
	
	var sourceId = null;
	$(".connectPOIbutton").click(function(e) {
		var targetId = $(this).attr("id").substr(1);
		if(sourceId == null) {
			sourceId = targetId;
			return;
		}
		var content = $("#POIcontent").val();
		var edgeTabs = $("#edgeList").find(".updateEdgebutton");
		var lastEdgeTargetId = itineraryplanningService.EdgeNodeMap.getHeadNode().identifier;
		if(edgeTabs.size() > 0)
			lastEdgeTargetId = $(edgeTabs[edgeTabs.size() - 1]).attr("id").substr(1);
		connect(lastEdgeTargetId, sourceId, targetId, "", content);
		sourceId = targetId = null;
	});
};

function bindEdgeClickEvent() {
	//bind click event of every button
	$(".deleteEdgebutton").click(function(e) {
		var targetId = $(this).attr("id").substr(1);
		disconnect(targetId);
	});
	
	$(".updateEdgebutton").click(function(e) {
		var targetId = $(this).attr("id").substr(1);
		var content = $("#POIcontent").val();
		updateEdge(targetId, "", content);
	});
};


$("#broadMessage").click(function() {
	flag = $("#broadMessage").is(':checked')
	if (flag != null && flag == true) {
		itineraryplanningService.remoteRunningState = true;
		itineraryplanningService.run();
	} else {
		itineraryplanningService.remoteRunningState = false;
	}
});