package org.cokit.server;

import java.io.IOException;
import java.sql.Timestamp;
import java.util.Date;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArraySet;

import javax.servlet.http.HttpSession;
import javax.websocket.OnClose;
import javax.websocket.OnMessage;
import javax.websocket.OnOpen;
import javax.websocket.Session;
import javax.websocket.server.ServerEndpoint;

import org.apache.log4j.Logger;
import org.cokit.session.SessionHandler;
import org.cokit.session.SessionPool;

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
		String siteId = messageJSON.getString("siteId");

		// create sessionHandler for cokey
		this.sessionPool = SessionPool.newInstance();
		sessionPool.addSessionHandler(cokey);

		// old session
		if (registerTable.contains(sessionId)) {
			// session shifts
			if (!cokey.equals(registerTable.get(sessionId).toString())) {
				// close past connection
				SessionHandler pastSessionhandler = sessionPool
						.getSessionHandler(registerTable.get(sessionId));
				pastSessionhandler.closeConnection(siteId);

				// add new connection
				SessionHandler newSessionhandler = sessionPool
						.getSessionHandler(cokey);
				newSessionhandler.addSession(siteId, session);

			}
		} else { //new session
			// add new connection
			SessionHandler newSessionhandler = sessionPool
					.getSessionHandler(cokey);
			newSessionhandler.addSession(siteId, session);
		}
		//update register table
		registerTable.put(sessionId, cokey);
		
		
		

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
