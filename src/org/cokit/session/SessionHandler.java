package org.cokit.session;

import java.io.IOException;
import java.util.HashSet;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArraySet;

import javax.websocket.CloseReason;
import javax.websocket.CloseReason.CloseCodes;
import javax.websocket.Session;

import org.apache.log4j.Logger;

public class SessionHandler {
	private String cokey = "";

	// map from siteId to session
	private static final ConcurrentHashMap<String, Session> onlineUsers = new ConcurrentHashMap<String, Session>();

	private static final Logger logger = Logger.getLogger(SessionHandler.class
			.getName());

	public SessionHandler(String cokey) {
		this.setCokey(cokey);

	}

	/**
	 * add a a session to the session manager
	 * 
	 * @param session
	 */
	public void addSession(String siteId, Session session) {
		onlineUsers.put(siteId, session);
	}

	/**
	 * broad operation to all users who share the same sessionId it's better to
	 * use a message queue
	 * 
	 * @param message
	 *            return to client site
	 */
	public synchronized void broadcastToAll(String message) {
		logger.info("broadcast message" + message);
		Set<String> abnormalSessions = new HashSet<String>();
		for (String siteId : onlineUsers.keySet()) {
			try {
				Session user = onlineUsers.get(siteId);
				user.getBasicRemote().sendText(message);
			} catch (IOException e) {
				logger.info(siteId + "encounter a problem, terminte");
				abnormalSessions.add(siteId);
				e.printStackTrace();
			}
		}

		// terminiate abnormal session, it better use 'while'
		CloseReason cr = new CloseReason(CloseCodes.CANNOT_ACCEPT,
				"try it later");
		for (String siteId : abnormalSessions) {
			try {
				Session user = onlineUsers.get(siteId);
				user.close(cr);
			} catch (IOException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
			onlineUsers.remove(siteId);
		}
	}

	public synchronized void closeAllConnections() {
		// terminiate abnormal session, it better use 'while'
		CloseReason cr = new CloseReason(CloseCodes.GOING_AWAY, "done!");
		for (String siteId : onlineUsers.keySet()) {
			try {
				Session user = onlineUsers.get(siteId);
				user.close(cr);
			} catch (IOException e) {
			}
		}
		onlineUsers.clear();
	}

	public void closeConnection(String siteId) {
		if (onlineUsers.contains(siteId)) {
			CloseReason cr = new CloseReason(CloseCodes.GOING_AWAY, "done!");
			Session user = onlineUsers.get(siteId);
			try {
				user.close(cr);
				onlineUsers.remove(siteId);
			} catch (IOException e) {
				logger.info("close connection " + siteId + " failed");
				e.printStackTrace();
			}
		}
	}

	public String getCokey() {
		return cokey;
	}

	public void setCokey(String cokey) {
		this.cokey = cokey;
	}
}
