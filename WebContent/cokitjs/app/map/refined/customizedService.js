/**
 * AST-CORE dependencies, declare your customized service, inlcuding data model,
 * history buffer need include data/historyBuffer to declare history buffer need
 * include data/refined/basicData.js to declare data model need include
 * data/refined/timestamp.js to declare timestamp, which is necessary for
 * history buffer and data model
 */

function ItineraryPlanningService(owner, sender, sharedWorkSpace) {
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
	 * experiment 1 local response time
	 */
	this.responseTimers = new Array();
	
	this.getResponseTimerResult = function() {
		if (this.responseTimers.length <= 0)
			return;
		var res = "Total Response Time\n";
		for (index in this.responseTimers) {
			res += this.responseTimers[index] + ',';
		}
		console.log(res);
	};
	
	/**
	 * experiment 2 propagation delay time
	 */
	this.propagationTimers = new Array();
	
	this.getPropagationTimerResult = function() {
		if (this.propagationTimers.length <= 0)
			return;
		var res = "Total Propagation Time\n";
		for (index in this.propagationTimers) {
			res += this.propagationTimers[index] + ',';
		}
		console.log(res);
	};
	/**
	 * experiment 3 server performance
	 */
	this.ops = new Array();
	this.mspo = new Array();
	this.getServerPerformanceResult = function() {
		if (this.ops.length <= 0)
			return;
		var res = "ops\n";
		for (index in this.ops) {
			res += this.ops[index] + ',';
		}
		console.log(res);
		var res = "mspo\n";
		for (index in this.mspo) {
			res += this.mspo[index] + ',';
		}
		console.log(res);
	};
	/**
	 * experient over 
	 */
	/**
	 * side effect of deletePOI
	 */
	this.POIEdges = new Object();

	this.initWorkSpace = function() {
		this.sharedWorkSpace.init(this);
	};

	this.adjacentEdgeIdentifier = new Object(); // find every adjacent edge

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
		 * nodeMap basically only supports three types of functions: insert,
		 * delete, update a proper transformation and resuming is required here,
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
			for (index in edgesNearBy) {
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

			this.POIEdges[message.refinedOperation.data.startId]
					.push(message.timestamp.createIdentifier());
			this.POIEdges[message.refinedOperation.data.endId]
					.push(message.timestamp.createIdentifier());
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
			var message = this.localHistoryBuffer
					.get(this.localHistoryBuffer.tail);
//			this.execute(message);
			this.localHistoryBuffer.tail += 1;
			var cleanMessage = message.writeToMessage();
			this.sender.broadcast(cleanMessage);
		}

		var beginngTimer = new Date().getTime();   //experiment 1-1
		if (this.remoteRunningState == true) {
			while (this.remoteHistoryBuffer.tail < this.remoteHistoryBuffer
					.getSize()) {
				var message = this.remoteHistoryBuffer
						.get(this.remoteHistoryBuffer.tail);
				//experiment 2-1
				var currentTimer = new Date().getTime();
				this.propagationTimers.push(currentTimer - message.timestamp.localClock);
				
//				this.execute(message);
				this.remoteHistoryBuffer.tail += 1;
				//experiment 1-2
				currentTimer = new Date().getTime();
				this.responseTimers.push(currentTimer - beginngTimer);
			}
		}
		this.getResponseTimerResult();   //experiment 1-3
		this.getPropagationTimerResult();   //experiment 2-2
		this.getServerPerformanceResult();  //experiment 3-1
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
function userService() {

}
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
 * placeNameMapToPOIMarker[placeName] = null; } } } // create POIMarker function
 * createPOIMarker(place) { var latLng = place.geometry.location; var POIMarker =
 * new google.maps.Marker({ position : latLng, title : place.title, animation :
 * google.maps.Animation.DROP, }); placeNameMapToPOIMarker[place.title] =
 * POIMarker;
 * 
 * POIMarker.setMap(itineraryPlanningMap); POIMarker.addListener('click',
 * clictPOIEvent); } // fetch POIMarker function fetchPOIByName(placeName) { var
 * centerPoint = itineraryPlanningMap.getCenter(); var request = { location :
 * centerPoint, radius : '500', query : placeName }; service = new
 * google.maps.places.PlacesService(itineraryPlanningMap);
 * if(placeNameMapToPOIMarker[placeName] == null) { service.textSearch(request,
 * callback); } else { createPOIMarker(placeNameMapToPOIMarker[placeName]); } }
 */

/**
 * // POI search callback function place a POI down function callback(results,
 * status) { if (status == google.maps.places.PlacesServiceStatus.OK ) { if
 * (results.length > 0) { var place = results[0]; addPOIMarker(place);
 * createPOIMarker(place); } } else { alert("places services status is no ok"); } } //
 * function based on google map var stablePOIMarkers = new Object(); var
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
