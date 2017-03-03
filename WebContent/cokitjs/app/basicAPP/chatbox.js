//shared workspace
var chatBoxWorkspace = $("#workspace");
var user = getUrlParam("user");
//
function chatBubble(targetId, data) {
    this.user = data.user;
    this.time = data.time;
    this.content = data.content;
    this.targetId = targetId;

    this.createElement = function () {
        var element = "<li id='"
            + this.targetId
            + "' class='chatBubble'>"
            + this.content + "<span>from " + this.user + "</span></li>";
        return element;
    }

    this.createData = function () {
        return {user : this.user, time : this.time, content : this.content};
    }
}

//global variable, must be defined!!!
var engine = new ASTEngine("cokit", "CoKitServer", getUuid(), "chatbox", chatBoxWorkspace, chatBubble);

$("#sendButton").click(function() {
    var content = $("#input-box").text();
    if(content.length <= 0) {
        alert("can't be null!");
        return;
    }
    var timestamp = new Date().getTime();
    var data = {user : user, time : timestamp, content : content};
    var bubbles = $(".chatBubble");
    var preId = "0";
    if(bubbles.length > 0)
        preId = bubbles[bubbles.length-1].getAttribute("id");
    engine.insert(preId, data);
});


