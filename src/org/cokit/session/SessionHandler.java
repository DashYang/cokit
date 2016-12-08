package org.cokit.session;

import java.io.IOException;
import java.sql.Timestamp;
import java.util.Date;
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
	
	// handler global state
	private static int globalState = 0;
	
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
	 * assign a global state for message
	 * @return handler global state 
	 */
	public synchronized int assignHandlerGlobalState() {
		return globalState++;
	}
	
	
	/**
	 * 
	 * @return timestamp
	 */
	public String getGlobalClock() {
		Date nowDate = new Date();
		Timestamp newTime = new Timestamp(nowDate.getTime());
		return newTime.toString();
	}
	
	/**
	 * broad operation to all users who share the same sessionId it's better to
	 * use a message queue
	 * 
	 * @param message
	 * return to client site
	 */
	public synchronized void broadcastToAll(String message) {
		logger.info("broadcast message " + message);
		Set<String> abnormalSessions = new HashSet<String>();
		for (String siteId : onlineUsers.keySet()) {
			try {
				Session user = onlineUsers.get(siteId);
				if(user.isOpen())
					user.getBasicRemote().sendText(message);
				else
					abnormalSessions.add(siteId);
			} catch (IOException e) {
				logger.info(siteId + " encounter an IO problem, terminte");
				abnormalSessions.add(siteId);
				e.printStackTrace();
			} catch (Exception e) {
				logger.info(siteId + " encounter other problem, terminte");
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
		
		logger.info("broadcast message complete");
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
				removeConnection(siteId);
			} catch (IOException e) {
				logger.info("close connection " + siteId + " failed");
				e.printStackTrace();
			}
			logger.info("close connection " + siteId);
		}
	}
	
	public void removeConnection(String siteId) {
		onlineUsers.remove(siteId);
	}
	
	public String getCokey() {
		return cokey;
	}

	public void setCokey(String cokey) {
		this.cokey = cokey;
	}
}
