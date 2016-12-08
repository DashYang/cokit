package org.cokit.session;

import java.util.concurrent.ConcurrentHashMap;
import java.util.logging.Logger;

public class SessionPool {
	private static final Logger logger = Logger.getLogger(SessionPool.class
			.getName());
	private static SessionPool singleton = null;
	// map from cokey to sessionHaandler
	private static final ConcurrentHashMap<String, SessionHandler> sessionPool = new ConcurrentHashMap<String, SessionHandler>();

	private SessionPool() {

	}

	public static SessionPool newInstance() {
		if (singleton == null) {
			synchronized (SessionPool.class) {
				if (singleton == null) {
					singleton = new SessionPool();
				}
			}
		}
		return singleton;
	}

	public static SessionPool getInstance() {
		return singleton;
	}

	public synchronized void addSessionHandler(String cokey) {
		if (isExist(cokey) == false) {
			logger.info("new session handler " + cokey + " is added");
			SessionHandler sessionHandler = new SessionHandler(cokey);
			sessionPool.put(cokey, sessionHandler);
		}
	}

	public SessionHandler getSessionHandler(String cokey) {
		return sessionPool.get(cokey);
	}

	public void removeSessionHandler(String cokey) {
		SessionHandler sessionhandler = sessionPool.get(cokey);

		// close all connections of this session
		sessionhandler.closeAllConnections();
		sessionPool.remove(cokey);
		
	}

	public boolean isExist(String cokey) {
		return sessionPool.containsKey(cokey);
	}
}
