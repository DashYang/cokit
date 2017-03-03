var currentPath = window.document.location.href;
var pathName = window.document.location.pathname;
var pos = currentPath.indexOf(pathName);
var localhostPath = currentPath.substring(0, pos);
var wshostPath = localhostPath.replace("http", "ws");

/**
 * websocket pipe
 * to denote your sender and define the call back functions
 * @param project
 * @param serviceName
 * @param openCallBackFunction function openCallBackFunction()
 * @param receiveMessageCallBackFunction function openCallBackFunction(data)
 * @param closeCallBackFunction function closeCallBackFunction(data)
 */
function Sender(project, serviceName, cokey) {
	
	//var serviceURL = "/cokit/CoKitServer";
	this.serviceURL = "/" + project + "/" + serviceName;
	this.cokey = cokey;
	this.isReady = false;

	this.ws = new WebSocket(wshostPath + this.serviceURL);
	
	this.ws.onopen = function (evt) {
        //TODO
    };

    /**
     * engine is global variable, it's defined by customized service
     * @param evt
     */
	this.ws.onmessage = function(evt) {
        var jsonMessage = JSON.parse(evt.data);
        if(jsonMessage.action == "OPEN" && jsonMessage.result == "Connection Established") {
            //engine is a global variable
        	engine.sender.isReady = true;
            engine.sender.login();
            engine.fetchHistoryRecords();
            return;
        } else if(jsonMessage.action == "BROADCAST" || jsonMessage.action == "SYNCHRONIZATION") {
            var pipeMessageList = jsonMessage.result;

            //pipeMessages should be transformed
			var messageList = [];
			for(var index in pipeMessageList) {
				var message = new RefinedMessage(null, null);
                message.readFromMessage(pipeMessageList[index]);
                messageList.push(message);
			}

            engine.execute(messageList);
        }
    };

	this.ws.onclose = function (evt) {
        //TODO
    };
	
	this.send = function(message) {
		var jsonMessage = JSON.stringify(message);
		this.ws.send(jsonMessage);
	};

    this.basicFormatMessage = function(message, type) {
        var pipeMessage = new Object();
        pipeMessage.cokey = this.cokey;
        pipeMessage.action = type;
        pipeMessage.content = message;
        return pipeMessage;
    };

    //below methods are called by ASTEngine
	this.login = function() {
		while(this.isReady == null || this.isReady == false) ; // waiting for the connecting state over

        var pipeMessage = this.basicFormatMessage(null, "LOGIN");
        this.send(pipeMessage);
	};

	//messages are pushed by server
	this.broadcast = function(message) {
		var pipeMessage = this.basicFormatMessage(message, "BROADCAST")
		this.send(pipeMessage);
	};

	this.fetchRecords = function () {
		var pipeMessage = this.basicFormatMessage(null, "FETCH");
		this.send(pipeMessage);
    }

	//messages are fetched by client
	this.synchronizeMessages = function(message) {
        var pipeMessage = this.basicFormatMessage(message, "SYNCHRONIZATION")
        this.send(pipeMessage);
	};

	//bind callback function to handle message
	this.bindOnMessageCallBackFunction = function( callbackFunction ) {
		this.ws.onmessage = callbackFunction;
	};
}

/**
 * http pipe
 * @param project
 * @param serviceName
 * @param cokey
 * @param openCallBackFunction
 * @param receiveMessageCallBackFunction
 * @param closeCallBackFunction
 * @constructor
 */
function HttpSender(project, serviceName, cokey,
		openCallBackFunction,
		receiveMessageCallBackFunction,
		closeCallBackFunction) {
	
	//var serviceURL = "/cokit/CoKitServer";
	this.serviceName = serviceName;
	this.serviceURL = "/" + project + "/" + serviceName;
	this.cokey = cokey;
	
	this.handleMessageFunction = receiveMessageCallBackFunction;
	
	this.send = function(message) {
		var handleMessageFunction = this.handleMessageFunction;
		$.ajax({
			type : "post",// request type
			url : "./" + this.serviceName, // request URL
			dataType : "json",// data type
			data : {
				message : JSON.stringify(message),
				sessionId : me
			},
			success : function(jsonData) {
				handleMessageFunction(jsonData);
			}
		});
	};

	//synchronization
	this.synchronizeMessages = function(message) {
		message.cokey = this.cokey;
		message.action = "SYNCHRONIZATION";
		this.send(message);
	};

	//bind callback function
	this.bindOnMessageCallBackFunction = function( callbackFunction ) {
		this.handleMessageFunction = callbackFunction;
	};
}


