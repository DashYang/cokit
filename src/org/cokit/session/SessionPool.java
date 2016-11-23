package org.cokit.session;

import java.util.Hashtable;
import java.util.Map;

public class SessionPool<Description> {
	private static Map<String, SessionManager> sessionPool = new Hashtable<String, SessionManager>();
	
	public synchronized void addSessionManager(String cokey, SessionManager sessionManager) {
		sessionPool.put(cokey, sessionManager);
	}
	
	public SessionManager getSessionManager(String cokey) {
		return sessionPool.get(cokey);
	}
	
	public boolean isExist(String cokey) {
		return sessionPool.containsKey(cokey);
	}
}
