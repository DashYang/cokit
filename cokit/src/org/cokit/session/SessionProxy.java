package org.cokit.session;

import javax.websocket.Session;

/**
 * help session to handle message delivery 
 * @author dash
 * @version 1.0 date 2017-1-3
 * @since JDK1.6
 */
public class SessionProxy {
	private Session session;
	
	private int fetchIndex;
	public Object sessionLock;
	
	public SessionProxy(Session session) {
		super();
		this.session = session;
		this.fetchIndex = -1;
		this.sessionLock = new Object();
	}
	
	public Session getSession() {
		return session;
	}
	public void setSession(Session session) {
		this.session = session;
	}
	public int getFetchIndex() {
		return fetchIndex;
	}
	public void setFetchIndex(int fetchIndex) {
		this.fetchIndex = fetchIndex;
	}
	
}
