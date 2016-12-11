var currentPath = window.document.location.href; 
var pathName = window.document.location.pathname; 
var pos= currentPath.indexOf(pathName); 
var localhostPath = currentPath.substring(0,pos); 
var wshostPath = localhostPath.replace("http","ws");

//change the URL to suit your Service
var serviceURL = "/cokit/CoKitServer";   
var ws = new WebSocket( wshostPath + serviceURL);

ws.onopen = function(){
};

ws.onmessage = function(evt){
};

ws.onclose = function(evt){
};