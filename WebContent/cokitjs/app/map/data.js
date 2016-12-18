/**
 * declare your data's content in Node
 * getData and readData function is necessary 
 */

function POIData(placeName, content) {
	this.placeName = placeName;
	this.content = content;
	
	this.getData = function() {
		return {"placeName" : this.placeName, "content" : content};
	};
	
	this.readData = function(data) {
		this.placeName = data.placeName;
		this.content = data.content;
	};
}

function EdgeData(startId, startPOI, endId, endPOI, title, content) {
	this.startId = startId;
	this.startPOI = startPOI;
	this.endId = endId;
	this.endPOI = endPOI;
	this.title = title;
	this.content = content;
	
	this.getData = function() {
		return {"startId" : this.startId,
			"startPOI": this.startPOI,
			"endId"   : this.endId,
			"endPOI"  : this.endPOI,
			"title"   : this.title,
			"content" : this.content};
	};
	
	this.readData = function(data) {
		this.startId = data.startId;
		this.startPOITitle = data.startPOITitle;
		this.endId = data.endId;
		this.endPOITitle = data.endPOITitle;
		this.title = data.title;
		this.content = data.content;
	};
}