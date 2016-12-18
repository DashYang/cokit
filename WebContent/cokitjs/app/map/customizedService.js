/**
 * AST-CORE dependencies, declare your customized service, inlcuding data model,
 * history buffer need include data/historyBuffer to declare history buffer need
 * include data/refined/basicData.js to declare data model need include
 * data/refined/timestamp.js to declare timestamp, which is necessary for
 * history buffer and data model
 */

function ItineraryPlanningSerivce(owner, sender, sharedWorkSpace) {
	// initiate the history buffer
	this.localHistoryBuffer = new HistoryBuffer(owner);
	this.remoteHistoryBuffer = new HistoryBuffer(owner);

	// initiate the nodeMap
	this.POINodeMap = new NodeMap("POI", owner);
	this.EdgeNodeMap = new NodeMap("Edge", owner);

	// bind associated element
	this.sender = sender;
	this.sharedWorkSpace = sharedWorkSpace;

	this.localRunningState = true; // this state denotes the message of local
									// history buffer is executed or not;
	this.remoteRunningState = true; // this state denotes the message of remote
									// history buffer is executed or not;
	this.owner = owner; // to denote the owner of service
	
	/**
	 * experient
	 */
	this.timers = new Array();
	
	this.getTimerResult = function() {
		if(this.timers.length <= 0)
			return;
		var res = "";
		for(index in this.timers) {
			res += this.timers[index] + ',';
		}
		console.log(res);
	}
	/**
	 * side effect of deletePOI
	 */
	this.POIEdges = new Object();
	
	this.initWorkSpace = function() {
		this.sharedWorkSpace.init(this);
	};
	
	this.adjacentEdgeIdentifier = new Object();   //find every adjacent edge
	
	this.createLocalTimestamp = function() {
		var opcnt = this.localHistoryBuffer.getSize();
		var lastUpdateSRN = this.remoteHistoryBuffer.getSRN();
		return timestamp = new Timestamp(null, opcnt, this.owner, lastUpdateSRN);
	};

	/**
	 * declare the workflow of executing an operations. normally it follows: 0:
	 * save message in history buffer 1: execute operation in nodeMap, 2: send
	 * messages (local operations) 3: reflect the modifications in your
	 * customized data model
	 * 
	 */

	this.execute = function(message) {
		var type = message.refinedOperation.type;
		
		/**
		 * nodeMap basically only supports three types of functions: insert, delete, update
		 * a proper transformation and resuming is required here,
		 */
		switch (type) {
		case "addPOI":
			message.refinedOperation.type = "insert";
			this.POINodeMap.execute(message, this.localHistoryBuffer);
			message.refinedOperation.type = "addPOI";
			
			this.POIEdges[message.timestamp.createIdentifier()] = new Array();
			break;
		case "deletePOI":
			message.refinedOperation.type = "delete";
			this.POINodeMap.execute(message, this.localHistoryBuffer);
			message.refinedOperation.type = "deletePOI";
			
			var edgesNearBy = this.POIEdges[message.refinedOperation.targetId];
			for(index in edgesNearBy) {
				var identifier = edgesNearBy[index];
				this.EdgeNodeMap.find(identifier).isEffective = false;
			}
			break;
		case "updatePOI":
			message.refinedOperation.type = "update";
			this.POINodeMap.execute(message, this.localHistoryBuffer);
			message.refinedOperation.type = "updatePOI";
			break;
		case "connect":
			message.refinedOperation.type = "insert";
			this.EdgeNodeMap.execute(message, this.localHistoryBuffer);
			message.refinedOperation.type = "connect";
			
			this.POIEdges[message.refinedOperation.data.startId].push(message.timestamp.createIdentifier());
			this.POIEdges[message.refinedOperation.data.endId].push(message.timestamp.createIdentifier());
			break;
		case "disconnect":
			message.refinedOperation.type = "delete";
			this.EdgeNodeMap.execute(message, this.localHistoryBuffer);
			message.refinedOperation.type = "disconnect";
			break;
		case "updateEdge":
			message.refinedOperation.type = "update";
			this.EdgeNodeMap.execute(message, this.localHistoryBuffer);
			message.refinedOperation.type = "updateEdge";
			break;
		}
	};

	/**
	 * these two method(receiveMessage, run) are called by user interface
	 */
	this.receiveMessage = function(message) {
		var user = message.timestamp.user;
		// step 0
		if (user == owner) {
			this.localHistoryBuffer.push(message);
		} else {
			this.remoteHistoryBuffer.push(message);
		}
	};
	
	this.run = function() {
		while (this.localHistoryBuffer.tail < this.localHistoryBuffer.getSize()) {
			var message = this.localHistoryBuffer.get(this.localHistoryBuffer.tail);
			this.execute(message);
			this.localHistoryBuffer.tail += 1;
			var cleanMessage = message.writeToMessage();
			this.sender.broadcast(cleanMessage);
		}
		
		var beginngTimer = new Date().getTime();
		if (this.remoteRunningState == true) {
			while (this.remoteHistoryBuffer.tail < this.remoteHistoryBuffer.getSize()) {
				var message = this.remoteHistoryBuffer.get(this.remoteHistoryBuffer.tail);
				this.execute(message);
				this.remoteHistoryBuffer.tail += 1;
				var currentTimer = new Date().getTime();
				this.timers.push(currentTimer - beginngTimer);
			}
		}
		this.getTimerResult();
		// step 3
		this.sharedWorkSpace.reflectPOI(this.POINodeMap);
		this.sharedWorkSpace.reflectEdge(this.EdgeNodeMap);
	};
	
}

/**
 * Customized dependencies, declare your app's document elements, association
 * data model etc.
 */

// google map
var itineraryPlanningMap;
function initialize() {
	// initialize the google map
	itineraryPlanningMap = new google.maps.Map(document
			.getElementById('map-canvas'), {
		zoom : 10,
		center : {
			lat : 31.233,
			lng : 121.491
		}
	});

	// automatically fill in POI name
	var input = document.getElementById('POItitle');
	var searchBox = new google.maps.places.SearchBox(input);
	itineraryPlanningMap.addListener('bounds_changed', function() {
		searchBox.setBounds(itineraryPlanningMap.getBounds());
	});
}

google.maps.event.addDomListener(window, 'load', initialize);

/**
 * To define your shared workspace, capture every operation created by user
 * invoke service's function and get result
 */
function itineraryPlanningWorkSpace() {
	// shared work space
	this.POITabs = $("#POIList");
	this.EdgeTabs = $("#edgeList");

	// init service
	this.init = function(service) {
		this.reflectPOI(service.POINodeMap);
		this.reflectEdge(service.EdgeNodeMap);
	};

	this.reflectPOI = function(nodeMap) {
		var POIList = nodeMap.getEffectiveNodeList();
		var preId = nodeMap.getHeadNode().identifier;
		var listHtml = "";
		for (index in POIList) {
			var tarId = POIList[index].identifier;
			var currNode = POIList[index];
			var insertPOIButton = "<button id='i"
					+ preId
					+ "' type='button' class='insertPOIbutton btn btn-default btn-xs'>"
					+ "ib" + "</button>";
			var deletePOIButton = "<button id='d"
					+ tarId
					+ "' type='button' class='deletePOIbutton btn btn-default btn-xs'>"
					+ "d" + "</button>";
			var updatePOIButton = "<button id='u"
					+ tarId
					+ "' type='button' class='updatePOIbutton btn btn-default btn-xs'>"
					+ "u" + "</button>";
			var connectPOIButton = "<button id='u"
					+ tarId
					+ "' type='button' class='connectPOIbutton btn btn-default btn-xs'>"
					+ "c" + "</button>";

			listHtml += "<li id='poi" + tarId
					+ "'class='list-group-item list-group-item-info'><span>"
					+ currNode.data.placeName + " " + currNode.data.content
					+ "</span>" + insertPOIButton + deletePOIButton
					+ updatePOIButton + connectPOIButton + "</li>";

			preId = tarId;
		}

		var insertPOIButton = "<button id='i"
				+ preId
				+ "' type='button' class='insertPOIbutton btn btn-default btn-xs'>"
				+ "add" + "</button>";

		listHtml += "<li id='poi"
				+ "'class='list-group-item list-group-item-info'>"
				+ insertPOIButton + "</li>";

		this.POITabs.html(listHtml);
	};

	this.reflectEdge = function(edgeNodeMap) {
		var EdgeList = edgeNodeMap.getEffectiveNodeList();
		var listHtml = "";
		for (index in EdgeList) {
			var tarId = EdgeList[index].identifier;
			var currNode = EdgeList[index];
			var deleteEdgeButton = "<button id='d"
					+ tarId
					+ "' type='button' class='deleteEdgebutton btn btn-default btn-xs'>"
					+ "d" + "</button>";
			var updateEdgeButton = "<button id='u"
					+ tarId
					+ "' type='button' class='updateEdgebutton btn btn-default btn-xs'>"
					+ "u" + "</button>";

			listHtml += "<li id='edge" + tarId
					+ "'class='list-group-item list-group-item-info'><span>"
					+ currNode.data.startPOI + " -> " + currNode.data.endPOI
					+ " " + currNode.data.content + "</span>"
					+ deleteEdgeButton + updateEdgeButton + "</li>";

			preId = tarId;
		}
		this.EdgeTabs.html(listHtml);
	};
}

function userService() {
	
}
/**
 * var placeNameMapToPOIMarker = new Object(); var placeNameMapToPOIMarkerTimes =
 * new Object();
 * 
 * function addPOIMarker(place) { var placeName = place.title;
 * if(placeNameMapToPOIMarkerTimes[placeName] == null) {
 * placeNameMapToPOIMarkerTimes[placeName] = 0;
 * placeNameMapToPOIMarker[placeName] = place; } else
 * placeNameMapToPOIMarkerTimes[placeName] += 1; }
 * 
 * function deletePOIMarker(placeName) {
 * if(placeNameMapToPOIMarkerTimes[placeName] == null ||
 * placeNameMapToPOIMarkerTimes[placeName] <= 0) console.log("error, this POI is
 * empty!"); else { placeNameMapToPOIMarkerTimes[placeName] -= 1;
 * if(placeNameMapToPOIMarkerTimes[placeName] == 0) {
 * placeNameMapToPOIMarker[placeName].setMap(null);
 * placeNameMapToPOIMarker[placeName] = null; } } }
 *  // create POIMarker function createPOIMarker(place) { var latLng =
 * place.geometry.location; var POIMarker = new google.maps.Marker({ position :
 * latLng, title : place.title, animation : google.maps.Animation.DROP, });
 * placeNameMapToPOIMarker[place.title] = POIMarker;
 * 
 * POIMarker.setMap(itineraryPlanningMap); POIMarker.addListener('click',
 * clictPOIEvent); }
 *  // fetch POIMarker function fetchPOIByName(placeName) { var centerPoint =
 * itineraryPlanningMap.getCenter(); var request = { location : centerPoint,
 * radius : '500', query : placeName }; service = new
 * google.maps.places.PlacesService(itineraryPlanningMap);
 * if(placeNameMapToPOIMarker[placeName] == null) { service.textSearch(request,
 * callback); } else { createPOIMarker(placeNameMapToPOIMarker[placeName]); } }
 */

/**
 * // POI search callback function place a POI down function callback(results,
 * status) { if (status == google.maps.places.PlacesServiceStatus.OK ) { if
 * (results.length > 0) { var place = results[0]; addPOIMarker(place);
 * createPOIMarker(place); } } else { alert("places services status is no ok"); } }
 * 
 *  // function based on google map var stablePOIMarkers = new Object(); var
 * stableEdgeMarkers = new Object();
 * 
 * //add POI function addPOIBasedOnGoogleMap(node) { var POItitle =
 * node.data.placeName; fetchPOIByName(POItitle); }
 * 
 * 
 * 
 * function addLineBasedOnGoogleMap(node) { var identifier = node.identifier;
 * var selectedStartPOI = POIMarkers[node.data.startId]; var selectedEndPOI =
 * POIMarkers[node.data.endId];
 * 
 * var lineSymbol = { path : google.maps.SymbolPath.FORWARD_CLOSED_ARROW }; var
 * line = new google.maps.Polyline( { path : [ selectedStartPOI.getPosition(),
 * selectedEndPOI.getPosition() ], icons : [ { icon : lineSymbol, offset :
 * '100%' } ], map : map }); EdgeMarkers[identifier] = line; }
 */
