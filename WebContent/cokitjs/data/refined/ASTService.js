/**
 * the integration of basic elements an AST service need
 * @param serviceName the name of consistent service
 * @param owner the owner of consistent service
 * @param owner the sender of consistent service, send message to 
 * @returns
 */
function astcore(serviceName, owner, sender, sharedWorkSpace) {
	//to denote to the service
	this.serviceName = serviceName;
	this.owner = owner;
	
	//to initialize the node map
	this.nodeMap = new NodeMap(this.serviceName, this.owner);
	
	//to initialize the history buffer
	this.localHistoryBuffer = new HistoryBuffer();
	this.remoteHistoryBuffer = new HistoryBuffer();
	
	//to bind the sender
	this.sender = sender;
	
	//to bind the shared work space
	this.sharedWorkSpace = sharedWorkSpace;
	
	/**
	 * fetch history replica
	 */
	this.setNodeMap = function(nodeMap) {
		this.nodeMap = nodeMap;
	};
	
	/**
	 * declare the workflow of executing an operations.
	 * normally it follows: 0: save message in history buffer
	 * 						1: execute operation in nodeMap, 
	 * 						2: reflect the modifications in your customized data model
	 * 						3: send messages (local operations)
	 */

	this.execute = function(message) {
		var user = message.timestamp.user;

		//step 0
		if(user == me) {
			this.localHistoryBuffer.append(message);
		} else {
			this.remoteHistoryBuffer.append(message);
		}
		//step 1
		this.nodeMap.execute(message);
		
		//step 2
		this.sharedWorkSpace.reflect(this.nodeMap);
		
		//step 3
		if(user == me) {
			sender.send(message);
		}
	};
}