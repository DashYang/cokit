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
import org.cokit.data.refined.Operation;

import net.sf.json.JSONObject;

public class WebsocketClientManager {
	private static String url = "ws://localhost:8080";
	private static String project = "cokit";
	private static String service = "CoKitServer";
	private static Session session = null;
	
	public static void main(String[] args) {
		WebSocketContainer container = ContainerProvider.getWebSocketContainer();
		String uri = url + "/" + project + "/" + service;
		try {
			session = container.connectToServer(WebsocketClient.class, URI.create(uri));
		} catch (DeploymentException | IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} 
		
		/**
		 * Login
		 */
		JSONObject loginMessage = new JSONObject();
		loginMessage.element("cokey", "itinerary-planning-client");
		loginMessage.element("action", "LOGIN");
		try {
			session.getBasicRemote().sendText(loginMessage.toString());
			
			/**
			 * operations
			 */
			int operationNumber = 10;
			
			for(int i = 0 ; i < operationNumber ; i ++) {
				long currentTime = new Date().getTime();
				Timestamp timestamp = new Timestamp(1, i, "robot", -1, currentTime, currentTime);
				Operation<POI> operation = new Operation("0", null, "addPOI");
				JSONObject message = new JSONObject();
				message.element("operation", operation.writeToJSON());
				message.element("timestamp", timestamp.writeToJSON());
				message.element("cokey", "itinerary-planning-client");
				message.element("action", "BROADCAST");
				session.getBasicRemote().sendText(message.toString());
			}
			session.close();
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}
}
