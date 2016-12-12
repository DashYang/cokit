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
	
	this.createIdentifier = function() {
		return this.user+":"+this.opcnt;
	}
	//torder(this) < torder(ts)
	this.torder = function(ts) {
		if(this.user == ts.user)
			return this.opcnt < ts.opcnt;
		else if(this.user == me) {
			var srn = localMessageLog.list[this.opcnt].srn;
			if(srn == null) {
				return false;
			} else {
				return srn < ts.srn;
			}
		} else if(ts.user == me) {
			var srn = localMessageLog.list[ts.opcnt].srn;
			if(srn == null) {
				return true;
			} else {
				return this.srn < srn;
			}
		} else {
			return this.srn < ts.SRN;
		}
	};
	
	//this -> ts
	this.isHappenedBefore = function(ts) {
		if (this.user == ts.user) {   //L->L R->R(same user)
			if (this.opcnt < ts.opcnt) {
				return true;
			} else {
				return false;
			}
		} else if (this.user != me && ts.user != me) { // R->R(different user)
			if (this.srn <= this.lastUpdateSRN) {
				return true;
			}
			else {
				return false;
			}
		} else if (this.user == me) {                     //L->R
			var opcnt = this.opcnt;
			var srn = localMessageLog.get(opcnt).srn;      //find from ackmap
			if (srn != null
					&& srn <= ts.lastUpdateSRN) {
				return true;
			} else {
				return false;
			}
		} else {                                                
			if (this.srn <= ts.lastUpdateSRN) {           //R->L
				return true;
			}
			else {
				return false;
			}
		}
	};
}

Timestamp.createZeroTimestamp = function(user) {
	return new Timestamp(-1,-1, user, -1); 
}

Timestamp.createInfiniteTimestamp = function(user) {
	return new Timestamp(0x3fffffff,0x3fffffff,user,0x3fffffff);
}

// ts1 -> ts2
function isHappenedBefore(ts1, ts2) {
	if (ts1.user == ts2.user) {   //L->L R->R(same user)
		if (ts1.opcnt < ts2.opcnt) {
			return true;
		} else {
			return false;
		}
	} else if (ts1.user != me && ts2.user != me) { // R->R(different user)
		if (ts1.srn <= ts2.lastUpdateSRN) {
			return true;
		}
		else {
			return false;
		}
	} else if (ts1.user == myuser) {                     //L->R
		var opcnt = ts1.opcnt;
		var srn = localMessageLog.get(opcnt).srn;      //find from ackmap
		if (srn != null
				&& srn <= ts2.lastUpdateSRN) {
			return true;
		} else {
			return false;
		}
	} else {                                                
		if (ts1.srn <= ts2.lastUpdateSRN) {           //R->L
			return true;
		}
		else {
			return false;
		}
	}
}

function isConcurrent(ts1, ts2) {
	if(isHappenedBefore(ts1,ts2) || isHappenedBefore(ts2,ts1))
		return false;
	return true;
}

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

function torderBasedOnTS(ts1, ts2) {
	if(ts1.user == ts2.user)
		return ts1.opcnt < ts2.opcnt;
	else if(ts1.user == me) {
		var srn = localMessageLog.list[ts1.opcnt].srn;
		if(srn == null) {
			return false;
		} else {
			return srn < ts2.srn;
		}
	} else if(ts2.user == username) {
		var srn = localMessageLog.list[ts2.opcnt].srn;
		if(srn == null) {
			return true;
		} else {
			return sv1.srn < srn;
		}
	} else {
		return sv1.SRN < sv2.SRN;
	}
} 



