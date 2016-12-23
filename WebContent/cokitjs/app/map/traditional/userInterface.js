/**
 * parameters from web applications
 */
//to denote who I am, necessary! default me is an uuid
var me = getUrlParam("user");
var cokey = "itineraryplanning-traditional";

var sender = new Sender("cokit", "CoKitServer", cokey, null, fetchHistoryRecordCallBackFuncion, null);

var sharedWorkSpace = new itineraryPlanningWorkSpace();
var itineraryplanningService = new ItineraryPlanningService(me, sender, sharedWorkSpace);

/**
 * fetch histroy records
 */
function fetchMessages() {
	var timestamp = itineraryplanningService.createLocalTimestamp();
	var message = new TraditionalMessage(null, timestamp);
	sender.synchronizeMessages(message);
}

function fetchHistoryRecordCallBackFuncion(evt) {
	var jsonMessage = evt.data;
	if(jsonMessage == "Connection Established") {
		sender.isReady = true;
		sender.login();
		fetchMessages();
		return;
	}
	var cleanmessages = JSON.parse(jsonMessage);
	
	for(var index in cleanmessages) {
		var cleanmessage = cleanmessages[index];
		var message = new TraditionalMessage(null,null);
		message.readFromMessage(cleanmessage);
		itineraryplanningService.receiveMessage(message);
	}
	itineraryplanningService.run();
	
	bindPOIClickEvent();
	bindEdgeClickEvent();
	sender.bindOnMessageCallBackFunction(onMessage);
}
/**
 * fetch over
 */

function onOpen() {
	console.log("open");
}

function onMessage(evt) {
	var jsonMessage = evt.data;
	if(jsonMessage == "Connection Established") {
		sender.isReady = true;
		sender.login();
		return;
	}
	var cleanmessage = JSON.parse(jsonMessage);
	var message = new TraditionalMessage(null,null);
	message.readFromMessage(cleanmessage);
	itineraryplanningService.receiveMessage(message);
	itineraryplanningService.run();
	
	bindPOIClickEvent();
	bindEdgeClickEvent();
}

//init the app
itineraryplanningService.initWorkSpace();
bindPOIClickEvent();
bindEdgeClickEvent();

var nodeToEdge = new Object();
function addPOI(index, placeName, content) {
	//create message
	var timestamp = itineraryplanningService.createLocalTimestamp();
	var data = new POIData(placeName, content);
	var operation = new TraditionalOperation("addPOI", index, data.getData());
	var message = new TraditionalMessage(operation, timestamp);
	
	itineraryplanningService.receiveMessage(message);
	itineraryplanningService.run();
	
	bindPOIClickEvent();
	bindEdgeClickEvent();
}

function deletePOI(index) {
	//create message
	var timestamp = itineraryplanningService.createLocalTimestamp();
	var operation = new TraditionalOperation("deletePOI", index, null);
	var message = new TraditionalMessage(operation, timestamp);
	
	itineraryplanningService.receiveMessage(message);
	itineraryplanningService.run();
	
	bindPOIClickEvent();
	bindEdgeClickEvent();
}

function connect(targetId, startIndex, endIndex, title, content) {
	//create message
	var timestamp = itineraryplanningService.createLocalTimestamp();
	//
	var startPOITitle = itineraryplanningService.tempEffectivePOIList[startIndex].placeName;
	var endPOITitle = itineraryplanningService.tempEffectivePOIList[endIndex].placeName;
	var data = new EdgeData(startIndex, startPOITitle, endIndex, endPOITitle, title, content);
	
	var operation = new TraditionalOperation("connect", targetId, data.getData());
	var message = new TraditionalMessage(operation, timestamp);
	
	itineraryplanningService.receiveMessage(message);
	itineraryplanningService.run();
	
	bindPOIClickEvent();
	bindEdgeClickEvent();
	
}

function disconnect(targetIndex) {
	//create message
	var timestamp = itineraryplanningService.createLocalTimestamp();
	var operation = new TraditionalOperation("disconnect", targetIndex, null);
	var message = new TraditionalMessage(operation, timestamp);

	itineraryplanningService.receiveMessage(message);
	itineraryplanningService.run();
	
	bindPOIClickEvent();
	bindEdgeClickEvent();
} 


function updateMessageFromArrayList(type, arrayList, targetIndex, content) {
	//create message
	var timestamp = itineraryplanningService.createLocalTimestamp();
	
	var oldData = arrayList[targetIndex];
	oldData.content = content; 
	
	var operation = new TraditionalOperation(type, targetIndex, oldData);
	var message = new TraditionalMessage(operation, timestamp);
	return message;
}
function updatePOI(targetIndex, content) {
	var message = updateMessageFromArrayList("updatePOI", itineraryplanningService.tempEffectivePOIList, targetIndex, content);
	
	itineraryplanningService.receiveMessage(message);
	itineraryplanningService.run();
	
	bindPOIClickEvent();
	bindEdgeClickEvent();
}

function updateEdge(targetIndex, content) {
	var message = updateMessageFromArrayList("updateEdge", itineraryplanningService.tempEffectiveEdgeList, targetIndex, content);
	
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
		var lastEdgeTargetIndex = itineraryplanningService.tempEffectiveEdgeList.length;
		connect(lastEdgeTargetIndex, sourceId, targetId, "", content);
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
		updateEdge(targetId,  content);
	});
};


$("#broadMessage").click(function() {
	var flag = $("#broadMessage").is(':checked')
	if (flag != null && flag == true) {
		itineraryplanningService.remoteRunningState = true;
		itineraryplanningService.run();
	} else {
		itineraryplanningService.remoteRunningState = false;
	}
});