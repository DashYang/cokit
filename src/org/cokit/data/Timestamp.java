package org.cokit.data;

/**
 * 
 * @author dash
 * a mark of document's state. based on the logical clock
 * 
 */
public class Timestamp {
	//important and necessary
	private int globalState;       // server receives an operation and assigned a continuous number
	private int localState;        // local generates an operation and assigned a continuous number
	private String siteId;         // the identifier of client site
	private int lastUpdateState;   // latest remote operation's globalState
	
	//in addition not necessary
	private Timestamp globalClock;  // use real timestamp to represent globalState
	private Timestamp localClock;   // use real timestamp to represent localState
	
	public Timestamp(int globalState, int localState, String siteId, int lastUpdateState) {
		this.globalState = globalState;
		this.localState = localState;
		this.siteId = siteId;
		this.lastUpdateState = lastUpdateState;
	}
	
	public Timestamp(int globalState, int localState, String siteId, int lastUpdateState,
			Timestamp globalClock, Timestamp localClock) {
		this.globalState = globalState;
		this.localState = localState;
		this.siteId = siteId;
		this.lastUpdateState = lastUpdateState;
		
		this.globalClock = globalClock;
		this.localClock = localClock;
	}
	
	public int getGlobalState() {
		return globalState;
	}
	public void setGlobalState(int globalState) {
		this.globalState = globalState;
	}
	public int getLocalState() {
		return localState;
	}
	public void setLocalState(int localState) {
		this.localState = localState;
	}
	public String getSiteId() {
		return siteId;
	}
	public void setSiteId(String siteId) {
		this.siteId = siteId;
	}
	public int getLastUpdateState() {
		return lastUpdateState;
	}
	public void setLastUpdateState(int lastUpdateState) {
		this.lastUpdateState = lastUpdateState;
	}
	public Timestamp getGlobalClock() {
		return globalClock;
	}
	public void setGlobalClock(Timestamp globalClock) {
		this.globalClock = globalClock;
	}
	public Timestamp getLocalClock() {
		return localClock;
	}
	public void setLocalClock(Timestamp localClock) {
		this.localClock = localClock;
	}
	
	
}
