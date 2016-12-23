var currentPath = window.document.location.href;
var pathName = window.document.location.pathname;
var pos = currentPath.indexOf(pathName);
var localhostPath = currentPath.substring(0, pos);
var wshostPath = localhostPath.replace("http", "ws");

/**
 * to denote your sender and define the call back functions
 * @param project
 * @param serviceName
 * @param openCallBackFunction function openCallBackFunction()
 * @param receiveMessageCallBackFunction function openCallBackFunction(data)
 * @param closeCallBackFunction function closeCallBackFunction(data)
 */
function Sender(project, serviceName, cokey,
		openCallBackFunction,
		receiveMessageCallBackFunction,
		closeCallBackFunction) {
	
	//var serviceURL = "/cokit/CoKitServer";
	this.serviceURL = "/" + project + "/" + serviceName;
	this.cokey = cokey;
	this.isReady == false;
	
	this.ws = new WebSocket(wshostPath + this.serviceURL);
	
	this.ws.onopen = openCallBackFunction;

	this.ws.onmessage = receiveMessageCallBackFunction;

	this.ws.onclose = closeCallBackFunction;
	
	this.send = function(message) {
		var jsonMessage = JSON.stringify(message);
		this.ws.send(jsonMessage);
	};
	this.login = function() {
		while(this.isReady == null || this.isReady == false) ; // waiting for the connecting state over
			
		var message = new Object();
		message.cokey = this.cokey;
		message.action = "LOGIN";
		this.send(message);
	};
	
	this.broadcast = function(message) {
		message.cokey = this.cokey;
		message.action = "BROADCAST";
		this.send(message);
	};
	
	this.synchronizeMessages = function(message) {
		message.cokey = this.cokey;
		message.action = "SYNCHRONIZATION";
		this.send(message);
	};
	
	this.bindOnMessageCallBackFunction = function( callbackFunction ) {
		this.ws.onmessage = callbackFunction;
	}
}