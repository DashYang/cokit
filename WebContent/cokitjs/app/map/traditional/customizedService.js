function ItineraryPlanningService(owner, sender, sharedWorkSpace) {
	// initiate the history buffer
	this.localHistoryBuffer = new HistoryBuffer(owner);
	this.remoteHistoryBuffer = new HistoryBuffer(owner);
	this.owner = owner; // to denote the owner of service
	// initiate the arrayList
	this.POIArrayList = new ArrayList("POI", owner);
	this.EdgeArrayList = new ArrayList("Edge", owner);
	
	
	// temporary effetctive data
	this.tempEffectivePOIList = null;
	this.tempEffectiveEdgeList = null;
	// bind associated element
	this.sender = sender;
	this.sharedWorkSpace = sharedWorkSpace;

	/** this state denotes the message of remote history buffer is executed or
	 	not;
	 **/
	this.remoteRunningState = true;

	/**
	 * experiment
	 */
	this.timers = new Array();

	this.getTimerResult = function() {
		if (this.timers.length <= 0)
			return;
		var res = "";
		for (var index in this.timers) {
			res += this.timers[index] + ',';
		}
		console.log(res);
	};

	this.initWorkSpace = function() {
		this.sharedWorkSpace.initTraditional(this);
	};

	this.createLocalTimestamp = function() {
		var opcnt = this.localHistoryBuffer.getSize();
		var lastUpdateSRN = this.remoteHistoryBuffer.getSRN();
		return new Timestamp(null, opcnt, this.owner, lastUpdateSRN);
	};

	/**
	 * declare the workflow of executing an operations. normally it follows: 0:
	 * save message in history buffer 1: execute operation in data model, 2: send
	 * messages (local operations) 3: reflect the modifications in your
	 * customized data model
	 * 
	 */

	this.execute = function(message) {
		var type = message.traditionalOperation.type;

		/**
		 * nodeMap basically only supports three types of functions: insert,
		 * delete, update a proper transformation and resuming is required here,
		 */
		var currentTimestamp = this.createLocalTimestamp();
		switch (type) {
		case "addPOI":
			message.traditionalOperation.type = "insert";
			this.POIArrayList.execute(message, this.localHistoryBuffer, currentTimestamp);
			message.traditionalOperation.type = "addPOI";
			break;
		case "deletePOI":
			message.traditionalOperation.type = "delete";
			var targetIdentifier = this.POIArrayList.execute(message, this.localHistoryBuffer, currentTimestamp);
			message.traditionalOperation.type = "deletePOI";

            /**
			 * side effect of delete POI
             */
			var edgeIndex = 1;
			for(;edgeIndex < this.EdgeArrayList.arrayList.length - 1; edgeIndex +=1) {
				var curEdge = this.EdgeArrayList.arrayList[edgeIndex];
				if(curEdge.data.startId == targetIdentifier || curEdge.data.endId == targetIdentifier) {
                    curEdge.forceDelete = true;
                }
			}

			break;
		case "updatePOI":
			message.traditionalOperation.type = "update";
			this.POIArrayList.execute(message, this.localHistoryBuffer, currentTimestamp);
			message.traditionalOperation.type = "updatePOI";
			break;
		case "connect":
			message.traditionalOperation.type = "insert";

            var startId = this.tempEffectivePOIList[message.traditionalOperation.data.startId].identifier;
            var endId = this.tempEffectivePOIList[message.traditionalOperation.data.endId].identifier;
            message.traditionalOperation.data.startId = startId;
            message.traditionalOperation.data.endId = endId;

			this.EdgeArrayList.execute(message, this.localHistoryBuffer, currentTimestamp);
			message.traditionalOperation.type = "connect";

			break;
		case "disconnect":
			message.traditionalOperation.type = "delete";
			this.EdgeArrayList.execute(message, this.localHistoryBuffer, currentTimestamp);
			message.traditionalOperation.type = "disconnect";
			break;
		case "updateEdge":
			message.traditionalOperation.type = "update";
			this.EdgeArrayList.execute(message, this.localHistoryBuffer, currentTimestamp);
			message.traditionalOperation.type = "updateEdge";
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
			this.execute(message);
			this.localHistoryBuffer.tail += 1;
			var cleanMessage = message.writeToMessage();
			this.sender.broadcast(cleanMessage);
		}

		var beginngTimer = new Date().getTime();
		if (this.remoteRunningState == true) {
			while (this.remoteHistoryBuffer.tail < this.remoteHistoryBuffer
					.getSize()) {
				var message = this.remoteHistoryBuffer
						.get(this.remoteHistoryBuffer.tail);
				this.execute(message);
				this.remoteHistoryBuffer.tail += 1;
				var currentTimer = new Date().getTime();
				this.timers.push(currentTimer - beginngTimer);
			}
		}
		this.getTimerResult();
		// step 3
		this.tempEffectivePOIList = this.POIArrayList.getEffectiveNodeList(this.localHistoryBuffer);
		this.tempEffectiveEdgeList = this.EdgeArrayList.getEffectiveNodeList(this.localHistoryBuffer);
		this.sharedWorkSpace.reflectPOIFromTraditionalDataModel(this.tempEffectivePOIList);
		this.sharedWorkSpace.reflectEdgeFromTraditionalDataModel(this.tempEffectiveEdgeList);
	};
}
