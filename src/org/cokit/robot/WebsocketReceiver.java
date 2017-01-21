package org.cokit.robot;

import java.util.HashMap;
import java.util.Map;
import java.util.logging.Logger;

import javax.websocket.ClientEndpoint;
import javax.websocket.OnError;
import javax.websocket.OnMessage;
import javax.websocket.OnOpen;
import javax.websocket.Session;

import org.cokit.data.ActionType;

import net.sf.json.JSONArray;
import net.sf.json.JSONObject;

@ClientEndpoint
public class WebsocketReceiver {
	private final static Map<String, Integer> sessionMap = new HashMap<>(); 
	private String sessionId = "";
	private static final Logger logger = Logger.getLogger(WebsocketReceiver.class.getName());
	
	@OnOpen
	public void onOpen(Session session) {
		sessionId = session.getId();
		System.out.println("Connected to endpoint: " + sessionId);
	}

	@OnMessage
	public void onMessage(String message) {
		JSONObject messageJSON = JSONObject.fromObject(message);
//		System.out.println(sessionId + " receive " + message);
		int lastUpdateSRN = -1;
		switch (ActionType.valueOf(messageJSON.getString("action"))) {
			case EXPERIMENTRESULT:
				logger.info(messageJSON.getString("OperationPerSecond"));
				logger.info(messageJSON.getString("OperationArrivedSecond"));
				break;
			case SYNCHRONIZATION:
				lastUpdateSRN = extractLastUpdateSRN(messageJSON);
				setLastUpdateSRN(lastUpdateSRN);
				break;
			case BROADCAST:
				lastUpdateSRN = extractLastUpdateSRN(messageJSON);
				setLastUpdateSRN(lastUpdateSRN);
				break;
			case SERVERPERFORMANCE:
				logger.info(messageJSON.getString("result"));
				break;
			default:
				break;
			}
		}

	private int extractLastUpdateSRN(JSONObject messageJSON) {
		JSONArray records;
		int size;
		int lastUpdateSRN;
		records = JSONArray.fromObject(messageJSON.get("result"));
		size = records.size();
		if(size == 0) return getLastUpdateSRN(sessionId);
		lastUpdateSRN = records.getJSONObject(size-1).getJSONObject("timestamp").getInt("srn");
		return lastUpdateSRN;
	}

	@OnError
	public void onError(Throwable t) {
		t.printStackTrace();
		System.out.println("error!");
	}

	public static int getLastUpdateSRN(String sessionId) {
		if(sessionMap.get(sessionId) != null) 
			return sessionMap.get(sessionId);
		return -1;
	}

	public void setLastUpdateSRN(int lastUpdateSRN) {
		sessionMap.put(sessionId, lastUpdateSRN);
	}
	
}