/**
 *
 * @param project web project
 * @param serviceName web server
 * @param owner
 * @param cokey to identify session
 * @param sharedWorkSpace shared workspace
 * @param template  single unit of shared workspace
 * @constructor
 */
function ASTEngine(project, serviceName, owner, cokey, sharedWorkSpace, template) {
	//to denote to the service
	this.serviceName = serviceName;
	this.owner = owner;
	
	//to initialize the node map
	this.nodeMap = new NodeMap(this.serviceName, this.owner, template);
	
	//to initialize the workflow
	this.workflow = new Workflow(this.owner);
	
	this.sender = new Sender(project, serviceName, cokey, this);
	
	//to bind the shared work space
	this.sharedWorkSpace = sharedWorkSpace;
	
	/**
	 * declare the workflow of executing an operations.
	 * normally it follows: 0: save message in history buffer
	 * 						1: execute operation in nodeMap, 
	 * 						2: reflect the modifications in your customized data model
	 * 						3: send messages (local operations)
	 */
	this.execute = function(messages) {

		this.workflow.receiveMessage(messages);  // 0
		
		var waitingToExecuteLocalMessageList = this.workflow.fetchLocalMessageList();
        var waitingToExecuteRemoteMessageList = this.workflow.fetchremoteMessageList();

        this.nodeMap.executeMessages(waitingToExecuteLocalMessageList);  // 1-1
		this.nodeMap.executeMessages(waitingToExecuteRemoteMessageList); // 1-2

		//reflect workspace
		if(waitingToExecuteLocalMessageList.length + waitingToExecuteRemoteMessageList.length > 0) {
            var elements = this.nodeMap.getEffectiveNodeList();
            var content = "";
            for (var index in elements) {
                content += elements[index].createElement();
            }
            this.sharedWorkSpace.html(content);
        }

		//default
		if(waitingToExecuteLocalMessageList.length > 0)
			this.sender.broadcast(waitingToExecuteLocalMessageList);         // 3
	};


	// three basic methods
	this.insert = function(preId, data) {
		var timestamp = this.workflow.createTimestamp();
		var operation = new RefinedOperation("insert", preId, data);
		var message = new RefinedMessage(operation, timestamp);
		var messages = [];
		messages.push(message);
		this.execute(messages);
	};

	this.delete = function(targetId, data) {
        var timestamp = this.workflow.createTimestamp();
        var operation = new RefinedOperation("delete", targetId, data);
        var message = new RefinedMessage(operation, timestamp);
        var messages = [];
        messages.push(message);
        this.execute(messages);
    };

    this.update = function(targetId, data) {
        var timestamp = this.workflow.createTimestamp();
        var operation = new RefinedOperation("update", targetId, data);
        var message = new RefinedMessage(operation, timestamp);
        var messages = [];
        messages.push(message);
        this.execute(messages);
    };

    this.fetchHistoryRecords = function () {
        this.sender.fetchRecords();
    };

}