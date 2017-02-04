/**
 * 
 * the basic data structure to support lock-free consistency maintenance
 * Node: location info
 * Timestamp: version info
 */
function Timestamp(srn, opcnt , user , lastUpdateSRN) {
	this.srn = srn;
	this.opcnt = opcnt;
	this.user = user;
	this.lastUpdateSRN = lastUpdateSRN;
	
	this.localClock = new Date().getTime();
	this.globalClock;
	
	this.writeToMessage = function() {
		return {srn : this.srn, opcnt : this.opcnt, user : this.user, lastUpdateSRN : this.lastUpdateSRN, 
			localClock : this.localClock, globalClock : this.globalClock};
	};
	
	this.readFromMessage = function (message) {
		this.srn = message.srn;
		this.opcnt = message.opcnt;
		this.user = message.user;
		this.lastUpdateSRN = message.lastUpdateSRN;
		
		this.localClock = message.localClock;
		this.globalClock = message.globalClock;
	};
	
	this.createIdentifier = function() {
		return this.user+":"+this.opcnt;
	};

	//torder(this) < torder(ts) need specify owner
	// this.torder = function(ts, localHistoryBuffer) {
	// 	//if this is infinite timestamp return false
	// 	if(this.opcnt == 0x3fffffff || ts.opcnt == -1)
	// 		return false;
	// 	//otherwise true
	// 	if(this.opcnt == -1 || ts.opcnt == 0x3fffffff)
	// 		return true;
	//
	// 	var me = localHistoryBuffer.owner;
	// 	if(this.user == ts.user)
	// 		return this.opcnt < ts.opcnt;
	// 	else if(this.user == me) {
	// 		var srn = localHistoryBuffer.get(this.opcnt).timestamp.srn;
	// 		if(srn == null) {
	// 			return false;
	// 		} else {
	// 			return srn < ts.srn;
	// 		}
	// 	} else if(ts.user == me) {
	// 		var srn = localHistoryBuffer.get(ts.opcnt).timestamp.srn;
	// 		if(srn == null) {
	// 			return true;
	// 		} else {
	// 			return this.srn < srn;
	// 		}
	// 	} else {
	// 		return this.srn < ts.srn;
	// 	}
	// };

	//without local history buffer
    this.torder = function(ts) {
        //if this is infinite timestamp return false
        if(this.opcnt == 0x3fffffff || ts.opcnt == -1)
            return false;
        //otherwise true
        if(this.opcnt == -1 || ts.opcnt == 0x3fffffff)
            return true;

        if(this.user == ts.user)
            return this.opcnt < ts.opcnt;
        else if(this.timestamp.srn == null) {
            return false;
        } else if(ts.srn == null) {
            return true;
        } else {
            return this.srn < ts.srn;  //both of them are not empty
        }
    };

	//this -> ts
    this.isHappenedBefore = function(ts) {
        //if ts is zero timestamp return true
        if(this.opcnt == -1 || ts.opcnt == 0x3fffffff)
            return true;
        //otherwise return true
        if(this.opcnt == 0x3fffffff || ts.opcnt == -1)
            return false;

        if (this.user == ts.user) {   //L->L R->R(same user)
            return this.opcnt < ts.opcnt;
        } else if (this.srn == null) { //ts's srn can'be null(both of them are null only happens when they are local ts)
            return true;
        } else {
            if (this.srn <= ts.lastUpdateSRN) {
                return true;
            }
            else {
                return false;
            }
        }
    };

	// this.isHappenedBefore = function(ts, localHistoryBuffer) {
	// 	//if ts is zero timestamp return true
	// 	if(this.opcnt == -1 || ts.opcnt == 0x3fffffff)
	// 		return true;
	// 	//otherwise return true
	// 	if(this.opcnt == 0x3fffffff || ts.opcnt == -1)
	// 		return false;
	//
	// 	var me = localHistoryBuffer.owner;
	// 	if (this.user == ts.user) {   //L->L R->R(same user)
	// 		if (this.opcnt < ts.opcnt) {
	// 			return true;
	// 		} else {
	// 			return false;
	// 		}
	// 	} else if (this.user != me && ts.user != me) { // R->R(different user)
	// 		if (this.srn <= ts.lastUpdateSRN) {
	// 			return true;
	// 		}
	// 		else {
	// 			return false;
	// 		}
	// 	} else if (this.user == me) {                     //L->R
	// 		var opcnt = this.opcnt;
	// 		var srn = localHistoryBuffer.get(opcnt).timestamp.srn;      //find from ackmap
	// 		if (srn != null
	// 				&& srn <= ts.lastUpdateSRN) {
	// 			return true;
	// 		} else {
	// 			return false;
	// 		}
	// 	} else {
	// 		if (this.srn <= ts.lastUpdateSRN) {           //R->L
	// 			return true;
	// 		}
	// 		else {
	// 			return false;
	// 		}
	// 	}
	// };
}

Timestamp.createZeroTimestamp = function(user) {
	return new Timestamp(-1,-1, user, -1); 
};

Timestamp.createInfiniteTimestamp = function(user) {
	return new Timestamp(0x3fffffff,0x3fffffff,user,0x3fffffff);
};

//total order is based on identifier
/**
 *function torder(ts1, ts2) {
 *	return ts.identifier < ts.identifier;
 *}
**/

/**
 * total order is based on global state
 * sv1 < sv2
 */


