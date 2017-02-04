package org.cokit.session;

import java.io.IOException;
import java.sql.Timestamp;
import java.text.DecimalFormat;
import java.text.NumberFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.Vector;
import java.util.concurrent.ConcurrentHashMap;

import javax.websocket.CloseReason;
import javax.websocket.CloseReason.CloseCodes;
import javax.websocket.Session;

import net.sf.json.JSONArray;
import net.sf.json.JSONObject;

import org.apache.log4j.Logger;
import org.cokit.data.MessageQueue;
import org.cokit.data.improved.ServerMessageQueue;
import org.cokit.experiment.Parameter;
import org.eclipse.jdt.internal.compiler.ast.ThisReference;

import com.sun.corba.se.spi.orb.Operation;

public class SessionHandler {
	private String cokey = "";

	// map from siteId to session
	private final ConcurrentHashMap<String, SessionProxy> onlineUsers = new ConcurrentHashMap<String, SessionProxy>();
	// server history buffer;
	private final MessageQueue<JSONObject> operationMessageQueue = new ServerMessageQueue<JSONObject>();

	private static final Logger logger = Logger.getLogger(SessionHandler.class
			.getName());


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
		SessionProxy sessionProxy = new SessionProxy(session);
		logger.info(session.getId() + " join " + cokey);
		onlineUsers.put(siteId, sessionProxy);
	}

	/**
	 * broad message to all users who share the same sessionId it's better to
	 * use a message queue
	 * 
	 * @param message
	 *            return to client site
	 */
	public void broadcastToAll(String message) {
		logger.info("broadcast message " + message);
		Set<String> abnormalSessions = new HashSet<String>();
		logger.info("broadcast user number: " + onlineUsers.keySet().size());
		for (String siteId : onlineUsers.keySet()) {
			try {
				SessionProxy proxy = onlineUsers.get(siteId);
				Session user = proxy.getSession();
				synchronized (proxy.sessionLock) {
					if (user.isOpen())
						user.getBasicRemote().sendText(message);
					else
						abnormalSessions.add(siteId);
				}

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
				Session user = onlineUsers.get(siteId).getSession();
				user.close(cr);
			} catch (IOException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
			onlineUsers.remove(siteId);
		}

		logger.info("broadcast message complete");
	}

	/**
	 * broad operation to all users who share the same sessionId it's better to
	 * use a message queue
	 * 
	 * return to client site
	 */
	public void broadcastOperationsToAll() {
//		logger.info("broadcast operations ");
		Set<String> abnormalSessions = new HashSet<String>();
//		logger.info("broadcast user number: " + onlineUsers.keySet().size());
		
		JSONObject resultJSON = new JSONObject();
		resultJSON.element("state", "OK");
		resultJSON.element("action", "BROADCAST");
		
		for (String siteId : onlineUsers.keySet()) {
			boolean isOpen = true;
			try {
				SessionProxy proxy = onlineUsers.get(siteId);
				Session user = proxy.getSession();
				synchronized (proxy.sessionLock) {
					if (user.isOpen() && isOpen) {
						int fetchIndex = proxy.getFetchIndex();
						List<JSONObject> messages = operationMessageQueue.getListFromIndex(proxy.getFetchIndex());
						if(messages.size() == 0) continue;   //empty, continue
						resultJSON.element("result", messages);
						user.getBasicRemote().sendText(resultJSON.toString());
						
						proxy.setFetchIndex(fetchIndex + messages.size());
					}
					else
						abnormalSessions.add(siteId);
				}
			} catch (IOException e) {
				logger.info(siteId + " encounter an IO problem, terminte");
				isOpen = false;
				abnormalSessions.add(siteId);
				e.printStackTrace();
			} catch (Exception e) {
				logger.info(siteId + " encounter other problem, terminte");
				isOpen = false;
				abnormalSessions.add(siteId);
				e.printStackTrace();
			}
		}

		// terminiate abnormal session, it better use 'while'
		CloseReason cr = new CloseReason(CloseCodes.CANNOT_ACCEPT,
				"try it later");
		for (String siteId : abnormalSessions) {
			try {
				Session user = onlineUsers.get(siteId).getSession();
				user.close(cr);
			} catch (IOException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
			onlineUsers.remove(siteId);
		}

//		logger.info("broadcast message complete");
	}

	public synchronized void closeAllConnections() {
		// terminiate abnormal session, it better use 'while'
		CloseReason cr = new CloseReason(CloseCodes.GOING_AWAY, "done!");
		for (String siteId : onlineUsers.keySet()) {
			try {
				Session user = onlineUsers.get(siteId).getSession();
				user.close(cr);
			} catch (IOException e) {
			}
		}
		onlineUsers.clear();
	}

	public void closeConnection(String siteId) {
		if (onlineUsers.contains(siteId)) {
			CloseReason cr = new CloseReason(CloseCodes.GOING_AWAY, "done!");
			Session user = onlineUsers.get(siteId).getSession();
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

	public void saveMessage(JSONObject message) {
		logger.info(this.cokey + " handler saves message : "
				+ message.toString());
		//empty message, ignore
		if(message.get("refinedOperation") == null) {
			logger.info("empty message, ignore");
			return;
		}
		List<JSONObject> messages = new ArrayList<JSONObject>();
		messages.add(message);
		operationMessageQueue.produce(messages);
	}

	public void saveMessages(JSONArray messages) {
		operationMessageQueue.produce(messages);
	}
	/**
	 * support client pull's method to synchronize Messages
	 * 
	 * @param lastUpdateSRN
	 * @return
	 */
	public List<JSONObject> synchronizeMessages(int lastUpdateSRN) {
		logger.info("fetch " + this.cokey + " records from " + lastUpdateSRN);
		List<JSONObject> result = operationMessageQueue.getListFromIndex(lastUpdateSRN);
		logger.info("total " + result.size() + " items are fetched");
		return result;
	}

	public String toString() {
		return this.cokey;
	}
}
