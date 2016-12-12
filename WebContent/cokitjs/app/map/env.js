//to denote who I am
var me = getUuid();

// AST dependencies
/**
 * need inlcude data/historyBuffer first create local history buffer and remote
 * hitory buffer
 */
localHistoryBuffer = new HistoryBuffer();
remoteHistoryBuffer = new HistoryBuffer();
/**
 * need inlcude data/refined/basicData.js first create NodeMap
 */
POINodeMap = new NodeMap("POI", me);
EdgeNodeMap = new NodeMap("POI", me);

// google map dependencies
var itineraryPlanningMap;
var placeNameMapToPOIMarker = new Object();
function initialize() {
	itineraryPlanningMap = new google.maps.Map(document
			.getElementById('map-canvas'), {
		zoom : 10,
		center : {
			lat : 31.233,
			lng : 121.491
		}
	});
	initGoogleAutoCompleteText();
}

// automatically fill in POI name
function initGoogleAutoCompleteText() {
	var input = document.getElementById('POItitle');
	var searchBox = new google.maps.places.SearchBox(input);
	itineraryPlanningMap.addListener('bounds_changed', function() {
		searchBox.setBounds(itineraryPlanningMap.getBounds());
	});
}

// create POIMarker
function createPOIMarker(place) {
	var latLng = place.geometry.location;
	var POIMarker = new google.maps.Marker({
		position  : latLng,
		title     : place.title,
		animation : google.maps.Animation.DROP,
	});
	placeNameMapToPOIMarker[place.title] = POIMarker;
	
	POIMarker.setMap(itineraryPlanningMap);
	POIMarker.addListener('click', clictPOIEvent);
}

// fetch POIMarker
function fetchPOIByName(placeName) {
	var centerPoint = itineraryPlanningMap.getCenter();
	var request = {
		location : centerPoint,
		radius : '500',
		query : placeName
	};
	service = new google.maps.places.PlacesService(itineraryPlanningMap);
	if(placeNameMapToPOIMarker[placeName] == null) {
		service.textSearch(request, callback);	
	} else {
		createPOIMarker(placeNameMapToPOIMarker[placeName]);
	}
}



// POI search callback function place a POI down
function callback(results, status) {
	if (status == google.maps.places.PlacesServiceStatus.OK /** && content != ""* */
	) {
		if (results.length > 0) {
			var place = results[0];
			placeNameMapToPOIMarker[place.title] = place;
			createPOIMarker(place);
		}
	} else {
		alert("places services status is no ok");
	}
}
google.maps.event.addDomListener(window, 'load', initialize);

// function based on google map
var stablePOIMarkers = new Object();
var stableEdgeMarkers = new Object();

//add POI
function addPOIBasedOnGoogleMap(node) {
	var POItitle = node.data.placeName;
	
	fetchPOIByName(POItitle);
}

function addLineBasedOnGoogleMap(node) {
	var identifier = node.identifier;
	var selectedStartPOI = POIMarkers[node.data.startId];
	var selectedEndPOI = POIMarkers[node.data.endId];
	
	var lineSymbol = {
		path : google.maps.SymbolPath.FORWARD_CLOSED_ARROW
	};
	var line = new google.maps.Polyline(
			{
				path : [ selectedStartPOI.getPosition(),
						selectedEndPOI.getPosition() ],
				icons : [ {
					icon : lineSymbol,
					offset : '100%'
				} ],
				map : map
			});
	EdgeMarkers[identifier] = line;
}

