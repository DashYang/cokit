package org.cokit.session;

import java.util.concurrent.ConcurrentHashMap;
import java.util.logging.Logger;

public class SessionPool {
	private Logger logger = null;
	private static SessionPool singleton = null;
	// map from cokey to sessionHaandler
	private ConcurrentHashMap<String, SessionHandler> sessionPool = null;

	private SessionPool() {
		logger = Logger.getLogger(SessionPool.class.getName());
		sessionPool = new ConcurrentHashMap<String, SessionHandler>();
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

	public synchronized void removeSessionHandler(String cokey) {
		SessionHandler sessionhandler = sessionPool.get(cokey);

		// close all connections of this session
		sessionhandler.closeAllConnections();
		sessionPool.remove(cokey);
		
	}

	public boolean isExist(String cokey) {
		return sessionPool.containsKey(cokey);
	}
}
