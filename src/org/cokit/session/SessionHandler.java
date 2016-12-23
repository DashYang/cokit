package org.cokit.session;

import java.io.IOException;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

import javax.websocket.CloseReason;
import javax.websocket.CloseReason.CloseCodes;
import javax.websocket.Session;

import net.sf.json.JSONObject;

import org.apache.log4j.Logger;
import org.eclipse.jdt.internal.compiler.ast.ThisReference;

import com.sun.corba.se.spi.orb.Operation;

public class SessionHandler {
	private String cokey = "";

	// map from siteId to session
	private static final ConcurrentHashMap<String, Session> onlineUsers = new ConcurrentHashMap<String, Session>();
	// server history buffer;
	private static final List<JSONObject> messageLog = new ArrayList<>();
	
	// handler global state
	private static int globalState = 0;
	
	private static final Logger logger = Logger.getLogger(SessionHandler.class
			.getName());
	
	
	/**
	 * server throughput rate experiment 
	 */
	private Long startTime = null;
	private Long currentTime = null;
	
	public String getCokey() {
		return cokey;
	}

	public void setCokey(String cokey) {
		this.cokey = cokey;
	}
	
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
		String newTime = String.valueOf(nowDate.getTime());
		return newTime;
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
		logger.info("broadcast user number: " + onlineUsers.keySet().size());
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
	
	
	public JSONObject completeTimestamp(JSONObject timestamp) {
		int globalState = assignHandlerGlobalState();
		String globalClock = getGlobalClock();
		timestamp.element("srn", globalState);
		timestamp.element("globalClock", globalClock);
		return timestamp;
	}
	
	public void saveMessage(JSONObject message) {
		logger.info(this.cokey + " handler saves message : " + message.toString());
		messageLog.add(message);
	}
	/**
	 * support client pull's method to synchronize Messages
	 * @param lastUpdateSrn
	 * @return
	 */
	public List<JSONObject> synchronizeMessages(int lastUpdateSRN) {
		logger.info("fetch " + this.cokey + " records");
		List<JSONObject> result = this.messageLog.subList(lastUpdateSRN+1, globalState);
		return result;
	}
	
	/**
	 * experiment: to calculate the throughput rate of server
	 */
	public void getThroughputRate() {
		currentTime = new Date().getTime();
		if(startTime == null) {
			startTime = currentTime;
		}
		if(currentTime - startTime != 0) {
			int operationNumber = messageLog.size();
			logger.info("ops: " + 1000.0 * operationNumber / (currentTime - startTime));
		}
	}
	
	public String toString() {
		return this.cokey;
	}
}
