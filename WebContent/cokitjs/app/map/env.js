//to denote who I am
var me = uuid;

// AST dependencies
/**
 * need inlcude data/historyBuffer first create local history buffer and remote
 * hitory buffer
 */
localHistoryBuffer = new HistoryBuffer();
remoteHistroyBuffer = new HistoryBuffer();
/**
 * need inlcude data/refined/basicData.js first create NodeMap
 */
POINodeMap = new NodeMap("POI", me);
EdgeNodeMap = new NodeMap("POI", me);

// google map dependencies
var itineraryPlanningMap;
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

function findPlace(placeName) {
	var request = {
		location : centerPoint,
		radius : '500',
		query : placeName
	};
	service = new google.maps.places.PlacesService(map);
	var place;
	service.textSearch(request, place = callback);
	return place;
}
// POI search callback function，to mark address
function callback(results, status) {
	if (status == google.maps.places.PlacesServiceStatus.OK /** && content != ""* */
	) {
		if (results.length > 0) {
			var place = results[0];
			return place;
		}
	} else {
		alert("places services status is no ok");
	}
}
google.maps.event.addDomListener(window, 'load', initialize);

// function based on google map
var POIMarkers = new Object();
var EdgeMarkers = new Object();

//call back functions
function addPOIBasedOnGoogleMap(node) {
	var identifier = node.identifier;
	var POItitle = node.data.placeName;
	var content = node.data.content;
	var place = findPlace(POItitle);
	var latLng = place.geometry.location;
	
	var POIMarker = new google.maps.Marker({
		position : latLng,
		title : title,
		content : content,
		identifier : identifier,
		animation : google.maps.Animation.DROP,
	});
	placeMarker(POIMarker, map);
	POIMarker.addListener('click', clictPOIEvent);

	POIMarkers[identifier] = POIMarker;
	map.panTo(latLng);
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

