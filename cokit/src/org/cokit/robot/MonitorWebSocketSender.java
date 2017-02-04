package org.cokit.robot;

import java.io.IOException;
import java.net.URI;
import java.util.Date;

import javax.websocket.ContainerProvider;
import javax.websocket.DeploymentException;
import javax.websocket.Session;
import javax.websocket.WebSocketContainer;

import org.cokit.data.Timestamp;
import org.cokit.data.customerized.POI;
import org.cokit.data.improved.Operation;

import net.sf.json.JSONObject;

/**
 * @author dash
 * @version 1.0 date 2017-1-8
 * @since JDK1.6
 */
public class MonitorWebSocketSender implements Runnable{
	private String url = "ws://localhost:8081";
	private String project = "cokit";
	private String service = "CoKitServer";
	private String username = "monitor";
	private Session session = null;
	private String cokey = "itinerary-planning-server";
	
	private int fetchNumber = 10;
	private int frequency = 1000;
	private boolean isAsync = true;
	
	/**
	 * 
	 * @param url		request URL
	 * @param project	project name
	 * @param service	service name
	 * @param username	user name
	 * @param frequency	frequency of request
	 * @param isAsync	is asychronous or not
	 */
	public MonitorWebSocketSender(String url, String project, String service, String username,
			int fetchNumber, int frequency, boolean isAsync) {
		this.url = url;
		this.project = project;
		this.service = service;
		this.username = username;
		
		this.fetchNumber = fetchNumber;
		this.frequency = frequency;
		this.isAsync = isAsync;
		
		WebSocketContainer container = ContainerProvider.getWebSocketContainer();
		String uri = url + "/" + project + "/" + service;
		try {
			session = container.connectToServer(MonitorWebSocketReceiver.class, URI.create(uri));
		} catch (DeploymentException de) {
			de.printStackTrace();
		} catch (IOException ie) {
			ie.printStackTrace();
		}
	}
	
	private void login() {
		 //Login
		JSONObject loginMessage = new JSONObject();
		loginMessage.element("cokey", cokey);
		loginMessage.element("action", "LOGIN");
		try {
			session.getBasicRemote().sendText(loginMessage.toString());
		}catch (IOException e) {
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
		try {
			session.getBasicRemote().sendText(message.toString());
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		sleep(1000);
		try {
			session.close();
		} catch (IOException e) {
			e.printStackTrace();
		}
	}
	
	/**
	 * @param i local opcnt
	 * @param action action type
	 * @param isEmpty empty operation or not
	 * @return
	 */
	private JSONObject createDummyOperation(int i, String action, boolean isEmpty) {
		long currentTime = new Date().getTime();
		Timestamp timestamp = new Timestamp(-1, i, username, MonitorWebSocketReceiver.getLastUpdateSRN(), currentTime, currentTime);
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
			e.printStackTrace();
		}
	}
	
	
	private void fetch() {
		for(int i = 0 ; i < fetchNumber ; i ++) {
			JSONObject message = createDummyOperation(i,"SYNCHRONIZATION", true);
			sendMessage(message);
			sleep(frequency);
		}
		JSONObject message = createDummyOperation(fetchNumber,"SYNCHRONIZATION", true);
		sendMessage(message);
	}
	
	@Override
	public void run() {
		login();
		if(isAsync == false) {
			fetch();
		} else {
			sleep(frequency * fetchNumber);
		}
		getExperimentResult();
		MonitorWebSocketReceiver.showPropagationDelay();
		sleep(10000);
		try {
			session.close();
		} catch (IOException e) {
			e.printStackTrace();
		}
	}
}
