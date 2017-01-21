package org.cokit.robot;

import java.util.Date;
import java.util.LinkedList;
import java.util.List;
import java.util.logging.Logger;

import javax.websocket.ClientEndpoint;
import javax.websocket.OnError;
import javax.websocket.OnMessage;
import javax.websocket.OnOpen;
import javax.websocket.Session;

import net.sf.json.JSONArray;
import net.sf.json.JSONObject;

import org.cokit.data.ActionType;

/**
 * @author dash
 * @version 1.0 date 2017-1-8
 * @since JDK1.6
 */
@ClientEndpoint
public class MonitorWebSocketReceiver {
	private final static List<Long> propagationDelayList = new LinkedList<>();
	private String sessionId = "";
	private static final Logger logger = Logger
			.getLogger("MonitorWebSocketClient");
	private static int lastUpdateSRN = -1;

	@OnOpen
	public void onOpen(Session session) {
		sessionId = session.getId();
		System.out.println("Connected to endpoint: " + sessionId);
	}

	@OnMessage
	public void onMessage(String message) {
		JSONObject messageJSON = JSONObject.fromObject(message);
		System.out.println(sessionId + " receive " + message);
		switch (ActionType.valueOf(messageJSON.getString("action"))) {
		case EXPERIMENTRESULT:
			logger.info(messageJSON.getString("OperationPerSecond"));
			logger.info(messageJSON.getString("msPerOperation"));
			logger.info(messageJSON.getString("OperationArrivedSecond"));
			break;
		case SYNCHRONIZATION:
			lastUpdateSRN = extractLastUpdateSRN(messageJSON);
			setAllProgationDelay(messageJSON);
			break;
		case BROADCAST:
			setAllProgationDelay(messageJSON);
			break;
		default:
			break;
		}
	}

	@OnError
	public void onError(Throwable t) {
		t.printStackTrace();
		System.out.println("error!");
	}

	// only store monitor user's propagation delay
	public void setAllProgationDelay(JSONObject messageJSON) {
		JSONArray records = JSONArray.fromObject(messageJSON.get("result"));
		int size = records.size();
		if (size == 0)
			return;
		for (int i = 0; i < size; i++) {
			JSONObject singleOperation = records.getJSONObject(i);
			long beginTime = singleOperation.getJSONObject("timestamp")
					.getLong("localClock");
			long endTime = new Date().getTime();
			propagationDelayList.add(endTime - beginTime);
		}
	}

	public static void showPropagationDelay() {
		System.out.println(propagationDelayList);
	}

	private int extractLastUpdateSRN(JSONObject messageJSON) {
		JSONArray records;
		int size;
		int lastUpdateSRN;
		records = JSONArray.fromObject(messageJSON.get("result"));
		size = records.size();
		if (size == 0)
			return this.lastUpdateSRN; 
		lastUpdateSRN = records.getJSONObject(size - 1)
				.getJSONObject("timestamp").getInt("srn");
		return lastUpdateSRN;
	}
	
	public static int getLastUpdateSRN() {
		return lastUpdateSRN;
	}
}
