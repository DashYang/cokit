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
	
	this.initTraditional = function(service) {
		this.reflectPOIFromTraditionalDataModel(service.POIArrayList.getEffectiveNodeList());
		this.reflectEdgeFromTraditionalDataModel(service.EdgeArrayList.getEffectiveNodeList());
	};

	this.reflectPOI = function(nodeMap) {
		var POIList = nodeMap.getEffectiveNodeList();
		var preId = nodeMap.getHeadNode().identifier;
		var listHtml = "";
		for (var index in POIList) {
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
		for (var index in EdgeList) {
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
	
	this.reflectPOIFromTraditionalDataModel = function (POIList) {
		var listHtml = "";
		for (var index in POIList) {
			var currNode = POIList[index];
			var insertPOIButton = "<button id='i"
					+ index
					+ "' type='button' class='insertPOIbutton btn btn-default btn-xs'>"
					+ "ib" + "</button>";
			var deletePOIButton = "<button id='d"
					+ index
					+ "' type='button' class='deletePOIbutton btn btn-default btn-xs'>"
					+ "d" + "</button>";
			var updatePOIButton = "<button id='u"
					+ index
					+ "' type='button' class='updatePOIbutton btn btn-default btn-xs'>"
					+ "u" + "</button>";
			var connectPOIButton = "<button id='u"
					+ index
					+ "' type='button' class='connectPOIbutton btn btn-default btn-xs'>"
					+ "c" + "</button>";

			listHtml += "<li id='poi" + index
					+ "'class='list-group-item list-group-item-info'><span>"
					+ currNode.placeName + " </span><span class='nodeContent'> " + currNode.content
					+ "</span>" + insertPOIButton + deletePOIButton
					+ updatePOIButton + connectPOIButton + "</li>";
		}

		var insertPOIButton = "<button id='i"
				+ POIList.length
				+ "' type='button' class='insertPOIbutton btn btn-default btn-xs'>"
				+ "add" + "</button>";

		listHtml += "<li id='poi"
				+ "'class='list-group-item list-group-item-info'>"
				+ insertPOIButton + "</li>";

		this.POITabs.html(listHtml);
	};
	
	this.reflectEdgeFromTraditionalDataModel = function (EdgeList) {
		var listHtml = "";
		for (var index in EdgeList) {
			var currNode = EdgeList[index];
			var deleteEdgeButton = "<button id='d"
					+ index
					+ "' type='button' class='deleteEdgebutton btn btn-default btn-xs'>"
					+ "d" + "</button>";
			var updateEdgeButton = "<button id='u"
					+ index
					+ "' type='button' class='updateEdgebutton btn btn-default btn-xs'>"
					+ "u" + "</button>";

			listHtml += "<li id='edge" + index
					+ "'class='list-group-item list-group-item-info'><span>"
					+ currNode.startPOI + " -> " + currNode.endPOI
					+ "</span><span class='nodeContent'> " + currNode.content + "</span>"
					+ deleteEdgeButton + updateEdgeButton + "</li>";

		}
		this.EdgeTabs.html(listHtml);
	};
}