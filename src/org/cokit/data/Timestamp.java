package org.cokit.data;

import net.sf.json.JSONObject;

/**
 * 
 * @author dash
 * a mark of document's state. based on the logical clock
 * 
 */
public class Timestamp {
	//important and necessary
	private int srn;       // server receives an operation and assigned a continuous number
	private int opcnt;        // local generates an operation and assigned a continuous number
	private String user;         // the identifier of client site
	private int lastUpdateSRN;   // latest remote operation's globalState
	
	//in addition not necessary
	private long localClock;  // use real timestamp to represent globalState
	private long globalClock;   // use real timestamp to represent localState
	
	public Timestamp(int srn, int opcnt, String user, int lastUpdateSRN,
			long localClock, long globalClock) {
		super();
		this.srn = srn;
		this.opcnt = opcnt;
		this.user = user;
		this.lastUpdateSRN = lastUpdateSRN;
		this.localClock = localClock;
		this.globalClock = globalClock;
	}
	
	public JSONObject writeToJSON() {
		JSONObject JSONtimstamp = new JSONObject();
		JSONtimstamp.element("srn", srn);
		JSONtimstamp.element("opcnt", opcnt);
		JSONtimstamp.element("user", user);
		JSONtimstamp.element("lastUpdateSRN", lastUpdateSRN);
		
		JSONtimstamp.element("localClock", localClock);
		JSONtimstamp.element("globalClock", globalClock);
		return JSONtimstamp;
	}
	public int getSrn() {
		return srn;
	}
	public void setSrn(int srn) {
		this.srn = srn;
	}
	public int getOpcnt() {
		return opcnt;
	}
	public void setOpcnt(int opcnt) {
		this.opcnt = opcnt;
	}
	public String getUser() {
		return user;
	}
	public void setUser(String user) {
		this.user = user;
	}
	public int getLastUpdateSRN() {
		return lastUpdateSRN;
	}
	public void setLastUpdateSRN(int lastUpdateSRN) {
		this.lastUpdateSRN = lastUpdateSRN;
	}
	public long getGlobalClock() {
		return globalClock;
	}
	public void setGlobalClock(long globalClock) {
		this.globalClock = globalClock;
	}
	public long getLocalClock() {
		return localClock;
	}
	public void setLocalClock(long localClock) {
		this.localClock = localClock;
	}
	
}
