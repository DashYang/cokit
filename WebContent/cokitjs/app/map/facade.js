/**
 * manage all of the click events
 */

var POItabs = new Array();

//update POI menu
function updatePOItabs() {
	var currNode = POINodeMap.getHeadNode();
	var tailNode = POINodeMap.getTailNode();
	var preId = currNode.identifier;
	currNode = POINodeMap.get(currNode.nextId);
	while (currNode != tailNode) {
		var tarId = currNode.identifier;
		var insertButton = "<button id='i"
				+ preId
				+ "' type='button' class='insertPOIbuttoon btn btn-default btn-xs'>"
				+ "ib" + "</button>";
		var deleteButton = "<button id='d"
				+ tarId
				+ "' type='button' class='deletePOIbuttoon btn btn-default btn-xs'>"
				+ "d" + "</button>";
		listHtml += "<li id='poi" + tarId
				+ "'class='list-group-item list-group-item-info'>"
				+ currNode.data.title + " " + currNode.data.content
				+ insertButton + deleteButton + "</li>";
		
		preId = tarId;
		currNode = POINodeMap.get(currNode.nextId);
	}
	var insertButton = "<button id='i"
		+ preId
		+ "' type='button' class='insertPOIbuttoon btn btn-default btn-xs'>"
		+ "add" + "</button>";
	
	listHtml += "<li id='poi"
	+ "'class='list-group-item list-group-item-info'>"
	+ insertButton  + "</li>";
	
	var targetBoard = $("#POIList");
	targetBoard.html(listHtml);
	
	$(".insertPOIbuttoon").click(function(e) {
		var preId = $(this).attr("id").substr(1);
		var placeName = $("#POItitle").val();
		var content = $("#POIcontent").val();
		if(placeName != null)
			addPOI(preId, placeName, content);
	});
	
	$(".deletePOIbuttoon").click(function(e) {
		var targetId = $(this).attr("id").substr(1);
		deletePOI(targetId);
	});
}

var lastActivePOI = null;
function clictPOIEvent() {
	var nextPOI = $(this)[0];
	if (lastActivePOI != null && nextPOI == lastActivePOI) {
		lastActivePOI.setAnimation(null);
	} else if(lastActivePOI == null) {
		lastActivePOI = nextPOI;
		lastActivePOI.setAnimation(google.maps.Animation.BOUNCE);
	} else {
		var title = $("#POItitle").val();
		var content = $("#POIcontent").val();
		var startId = lastActivePOI.identifier;
		var endId = lastActivePOI.identifier;
		
		connect(startId, endId, title, content);
	}
}

$("#broadMessage").click(function() {

});

$("#receiveMessage").click(function() {

});