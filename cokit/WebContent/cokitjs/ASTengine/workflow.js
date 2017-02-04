function Workflow(owner) {

    this.owner = owner;
    /**
     * two history buffer to handle every operation
     * @type {HistoryBuffer}
     */
    this.localHistoryBuffer = new HistoryBuffer(owner);
    this.remoteHistoryBuffer = new HistoryBuffer(owner);

    //data model state
    this.srn = -1;

    /**
     * create current timestamp
     * @returns {Timestamp}
     */
    this.createTimestamp = function() {
        var opcnt = this.localHistoryBuffer.getSize();
        var lastUpdateSRN = this.srn;
        var timestamp = new Timestamp(null, opcnt, this.owner, lastUpdateSRN);
        return timestamp;
    }
    /**
     * to collect every message created by user
     * @param messageList
     */
    this.receiveMessage = function(messageList) {
        for(var index in messageList) {
            var message = messageList[index];
            if(message.timestamp.user == this.owner) {
                this.localHistoryBuffer.push(message);
            } else {
                this.remoteHistoryBuffer.push(message);
            }
        }
        var localsrn = this.localHistoryBuffer.getSRN();
        var remotesrn = this.remoteHistoryBuffer.getSRN();
        if(localsrn < remotesrn)
            this.srn = remotesrn;
        else
            this.srn = localsrn;
    };

    /**
     * to return all local messages that are waiting to be executed and send
     * @returns {Array}
     */
    this.fetchLocalMessageList = function () {
        var localList = this.localHistoryBuffer.fetchWaitingToExecutedMessageList();
        return localList;
    };

    /**
     *  to return all remote messages that are waiting to be executed
     * @returns {Array}
     */
    this.fetchremoteMessageList = function () {
        var remoteList = this.remoteHistoryBuffer.fetchWaitingToExecutedMessageList();
        return remoteList;
    }
}