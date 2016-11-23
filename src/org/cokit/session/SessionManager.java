package org.cokit.session;

import java.io.IOException;
import java.util.HashSet;
import java.util.Set;
import java.util.concurrent.CopyOnWriteArraySet;

import javax.websocket.CloseReason;
import javax.websocket.CloseReason.CloseCodes;
import javax.websocket.Session;

import org.apache.log4j.Logger;
import org.cokit.data.SessionId;

public class SessionManager {
	private String cokey = "";

	private static final Set<Session> onlineUsers = new CopyOnWriteArraySet<Session>();
	
	private Logger logger = Logger.getLogger(this.getClass());
	
	public SessionManager(String cokey) {
		this.setCokey(cokey);
	}
	/**
	 * add a a session to the session manager
	 * @param session 
	 */
	public synchronized void addSession(Session session) {
		onlineUsers.add(session);
	}
	
	/**
	 * broad operation to all users who share the same sessionId
	 * it's better to use a message queue
	 * @param message return to client site
	 */
	public synchronized void broadcastToAll(String message) {
		logger.info("broadcast message" + message);
		Set<Session> abnormalSessions = new HashSet<Session>();
		for (Session user : onlineUsers) {
			try {
				user.getBasicRemote().sendText(message);
			} catch (IOException e) {
				logger.info(user.getId() + "encounter a problem, terminte");
				abnormalSessions.add(user);
				e.printStackTrace();
			}
		}
		
		//terminiate abnormal session, it better use 'while'
		CloseReason cr = new CloseReason(CloseCodes.CANNOT_ACCEPT, "try it later");
		for(Session user : abnormalSessions) {
			try {
				user.close(cr);
			} catch (IOException e) {
				// TODO Auto-generated catch block
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
