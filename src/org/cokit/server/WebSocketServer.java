package org.cokit.server;

import java.io.IOException;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;

import javax.websocket.OnClose;
import javax.websocket.OnMessage;
import javax.websocket.OnOpen;
import javax.websocket.Session;
import javax.websocket.server.ServerEndpoint;

import org.apache.log4j.Logger;
import org.cokit.data.ActionType;
import org.cokit.experiment.Parameter;
import org.cokit.session.SessionHandler;
import org.cokit.session.SessionPool;

import net.sf.json.JSONArray;
import net.sf.json.JSONObject;

/**
 * Servlet implementation class WebSocketServer to handle client's request
 */
@ServerEndpoint(value = "/CoKitServer")
public class WebSocketServer {
	private SessionPool sessionPool = null;
	private static final Logger logger = Logger.getLogger(WebSocketServer.class
			.getName());
	
	// map from session.id to cokey
	private static final ConcurrentHashMap<String, String> registerTable = new ConcurrentHashMap<String, String>();
	
	private static final Object broadcastLock = new Object(); 
	private static final Object	syncrhonizedLock = new Object(); 
	/**
	 * @OnOpen allows us to intercept the creation of a new session. The session
	 *         class allows us to send data to the user. In the method onOpen,
	 *         we'll let the user know that the handshake was successful.
	 */
	@OnOpen
	public void onOpen(Session session) {
		logger.info(session.getId() + " has opened a connection");
		try {
			session.getBasicRemote().sendText("Connection Established");
		} catch (IOException ex) {
			ex.printStackTrace();
		}
	}

	/**
	 * When a user sends a message to the server, this method will intercept the
	 * message and allow us to react to it. For now the message is read as a
	 * String.
	 */
	@OnMessage
	public void onMessage(String message, Session session) {
		logger.info("Message from " + session.getId() + ": " + message);
		JSONObject messageJSON = JSONObject.fromObject(message);

		// extract identified information from JSON Message
		String sessionId = session.getId();
		String cokey = messageJSON.getString("cokey");
		String action = messageJSON.getString("action");

		// important information misses, ignore
		if (cokey == null || action == null) {
			logger.info("unrecognized type of message, ignore..." + message);
			return;
		}

		this.sessionPool = SessionPool.newInstance();
		sessionPool.addSessionHandler(cokey);

		JSONObject timestampJSON = null;
		SessionHandler sessionHandler = null;
		switch (ActionType.valueOf(action)) {
		case LOGIN:
			// old session
			if (registerTable.contains(sessionId)) {
				// session shifts
				if (!cokey.equals(registerTable.get(sessionId).toString())) {
					String oldCoKey = registerTable.get(sessionId);
					// remove past connection
					SessionHandler pastSessionhandler = sessionPool
							.getSessionHandler(oldCoKey);
					pastSessionhandler.removeConnection(sessionId);

					// add new connection
					SessionHandler newSessionhandler = sessionPool
							.getSessionHandler(cokey);
					newSessionhandler.addSession(sessionId, session);

					logger.info("shift from  " + oldCoKey + " to " + cokey);
				}
			} else { // new session
				// add new connection
				SessionHandler newSessionhandler = sessionPool
						.getSessionHandler(cokey);
				newSessionhandler.addSession(sessionId, session);
			}
			// update register table
			registerTable.put(sessionId, cokey);
			break;
		case BROADCAST:
			// create sessionHandler for cokey
			sessionHandler = sessionPool
					.getSessionHandler(cokey);
			
			//avoid the disorder of broadcasting messages
			timestampJSON = messageJSON.getJSONObject("timestamp");
			synchronized (broadcastLock) {
				logger.info(sessionHandler.toString() + " handles this request");
				timestampJSON = sessionHandler.completeTimestamp(timestampJSON);
				messageJSON.element("timestamp", timestampJSON);
				Parameter parameter = sessionHandler.getThroughputRate();
				messageJSON.element("ops", parameter.getOperationPerSecondStr());
				messageJSON.element("mspo", parameter.getMillisecondPerOperationStr());
				// broadcast new message
				sessionHandler.broadcastToAll(messageJSON.toString());

				sessionHandler.saveMessage(messageJSON);
				sessionHandler.getThroughputRate();
			}
			break;
		case SYNCHRONIZATION:
			// create sessionHandler for cokey
			sessionHandler = sessionPool.getSessionHandler(cokey);

			// server completer timestamp
			timestampJSON = messageJSON.getJSONObject("timestamp");
			int lastUpdateSRN = timestampJSON.getInt("lastUpdateSRN");
			synchronized (syncrhonizedLock) {
				logger.info(sessionHandler.toString() + " handles this request");
				// fetch history message records
				List<JSONObject> histroyRecords = sessionHandler
					.synchronizeMessages(lastUpdateSRN);
				
				if(messageJSON.getJSONObject("refinedOperation") != null && !messageJSON.getJSONObject("refinedOperation").toString().equals("null")) {
					timestampJSON = sessionHandler.completeTimestamp(timestampJSON);
					messageJSON.element("timestamp", timestampJSON);
					Parameter parameter = sessionHandler.getThroughputRate();
					messageJSON.element("ops", parameter.getOperationPerSecondStr());
					messageJSON.element("mspo", parameter.getMillisecondPerOperationStr());
					sessionHandler.saveMessage(messageJSON);
					histroyRecords.add(messageJSON);
				}
				reply(session, histroyRecords);
			}
			break;
		default:
			logger.info("unrecognized type of message, ignore" + message);
			break;
		}
	}

	public void reply(Session requester, List<JSONObject> records) {
		JSONArray listJSONArray = new JSONArray();
		for (JSONObject message : records) {
			listJSONArray.add(message);
		}
		try {
			logger.info("reply " + listJSONArray.toString());
			requester.getBasicRemote().sendText(listJSONArray.toString());
		} catch (IOException e) {
			logger.info("requester " + requester.getId()
					+ " meets unexpected error, records are "
					+ listJSONArray.toString());
			e.printStackTrace();
		}
	}

	/**
	 * The user closes the connection.
	 * 
	 * Note: you can't send messages to the client from this method
	 */
	@OnClose
	public void onClose(Session session) {
		logger.info("Session " + session.getId() + " has ended");
	}

}
