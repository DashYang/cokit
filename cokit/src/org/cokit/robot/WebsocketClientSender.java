package org.cokit.robot;

import java.io.IOException;
import java.net.URI;
import java.util.Date;

import javax.websocket.ContainerProvider;
import javax.websocket.Session;
import javax.websocket.WebSocketContainer;

import org.cokit.data.Timestamp;
import org.cokit.data.customerized.POI;
import org.cokit.data.improved.Operation;

import net.sf.json.JSONObject;

public class WebsocketClientSender implements Runnable{
	private String url = "ws://localhost:8081";
	private String project = "cokit";
	private String service = "CoKitServer";
	private String username = "robot";
	private Session session = null;
	
	private String cokey = "itinerary-planning-server";
	
	private int addPOI = 10;
	private int addLine = 10;
	private int updatePOI = 25;
	private int deletePOI = 3;
	private int deleteLine = 2;
	
	private int frequency = 1000;
	
	private boolean isAsync = true;
	
	
	/**
	 * 
	 * @param url		request URL
	 * @param project	project name
	 * @param service	service name
	 * @param username	user name
	 * @param addPOI	addPOI number
	 * @param addLine	addLine number
	 * @param updatePOI	updatePOI number
	 * @param deletePOI	deletePOI number
	 * @param deleteLine	deleteLine Number
	 * @param frequency	frequency of request
	 * @param isAsync	is asychronous or not
	 */
	public WebsocketClientSender(String url, String project, String service, String username,
			int addPOI, int addLine, int updatePOI, int deletePOI, int deleteLine, int frequency,
			boolean isAsync) {
		this.url = url;
		this.project = project;
		this.service = service;
		this.username = username;
		
		this.addPOI = addPOI;
		this.addLine = addLine;
		this.updatePOI = updatePOI;
		this.deletePOI = deletePOI;
		this.deleteLine = deleteLine;
		this.frequency = frequency;
		
		this.isAsync = isAsync;
		
		WebSocketContainer container = ContainerProvider.getWebSocketContainer();
		String uri = url + "/" + project + "/" + service;
		try {
			session = container.connectToServer(WebsocketReceiver.class, URI.create(uri));
		} catch (Exception e) {
			e.printStackTrace();
		}
	}
	
	public String getCokey() {
		return cokey;
	}

	public void setCokey(String cokey) {
		this.cokey = cokey;
	}

	private void login() {
		/**
		 * Login
		 */
		JSONObject loginMessage = new JSONObject();
		loginMessage.element("cokey", cokey);
		loginMessage.element("action", "LOGIN");
		try {
			session.getBasicRemote().sendText(loginMessage.toString());
		}catch (IOException e) {
			e.printStackTrace();
		}
	}
	
	private void addPOI() {
		/**
		 * operations
		 */
		for(int i = 0 ; i < addPOI ; i ++) {
			JSONObject message = createDummyOperation(i,"BROADCAST",false);
			sendMessage(message);
			sleep(frequency);
		}
	}
	
	private void addPOISync() {
		/**
		 * operations
		 */
		for(int i = 0 ; i < addPOI ; i ++) {
			JSONObject message = createDummyOperation(i,"SYNCHRONIZATION", false);
			sendMessage(message);
			sleep(frequency);
		}
		JSONObject message = createDummyOperation(addPOI,"SYNCHRONIZATION", true);
		sendMessage(message);
	}
	
	/**
	 * 
	 * @param i local opcnt
	 * @param action action type
	 * @param isEmpty empty operation or not
	 * @return
	 */
	private JSONObject createDummyOperation(int i, String action, boolean isEmpty) {
		long currentTime = new Date().getTime();
		Timestamp timestamp = new Timestamp(-1, i, username, WebsocketReceiver.getLastUpdateSRN(session.getId()), currentTime, currentTime);
		Operation<POI> operation = new Operation("0", null, "addPOI");
		JSONObject message = new JSONObject();
		if(isEmpty == false)
			message.element("refinedOperation", operation.writeToJSON());
		message.element("timestamp", timestamp.writeToJSON());
		message.element("cokey", cokey);
		message.element("action", action);
		return message;
	}

	private void sendMessage(JSONObject message) {
		System.out.println(session.getId() + " send " + message.toString());
		try {
			session.getBasicRemote().sendText(message.toString());
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}
	
	private void sleep(int interval) {
		try {
			Thread.sleep(interval);
		} catch (InterruptedException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}
	
	public void getExperimentResult() {
		JSONObject message = new JSONObject();
		message.element("cokey", cokey);
		message.element("action", "EXPERIMENTRESULT");
		sendMessage(message);
		sleep(1000);
		try {
			session.close();
		} catch (IOException e) {
			e.printStackTrace();
		}
	}
	public static void main(String[] args) {
		WebsocketClientSender websocketClientProxy = new WebsocketClientSender("ws://218.193.130.182", 
				"cokit", "CoKitServer", "monitor", 0, 0 , 0, 0, 0, 1000, true);
		websocketClientProxy.getExperimentResult();
//		JSONObject message = websocketClientProxy.createDummyOperation(0,"BROADCAST",false);;
//		message.element("cokey",websocketClientProxy.getCokey());
//		message.element("action", "SERVERPERFORMANCE");
//		message.element("number", 10000);
//		websocketClientProxy.sendMessage(message);
		
		websocketClientProxy.sleep(1000000);
		try {
			websocketClientProxy.session.close();
		} catch (IOException e) {
			e.printStackTrace();
		}
	}

	@Override
	public void run() {
		login();
		if(isAsync == true) {
			addPOI();
		} else {
			addPOISync();
		}
		sleep(10000);
		try {
			session.close();
		} catch (IOException e) {
			e.printStackTrace();
		}
	}
}
