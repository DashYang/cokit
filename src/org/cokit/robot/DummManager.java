package org.cokit.robot;

import java.util.ArrayList;
import java.util.List;

import org.apache.log4j.PropertyConfigurator;

/**
 * @author dash
 * @version 1.0 date 2016-12-17
 * @since JDK1.6
 */
public class DummManager {
	
	public static void main(String args[]) {
		PropertyConfigurator.configure("log4j.properties");
		int concurrentUserNumber = 1;
		int operationNumber = 200;
		int requestFrequency = 1000;   //ms
		boolean isAsync = true;
		List<Thread> threads = new ArrayList<>();
		MonitorWebSocketSender mws = new MonitorWebSocketSender("ws://218.193.130.182", "cokit", "CoKitServer", "monitor",
				operationNumber, requestFrequency, isAsync);
		Thread monitorThread = new Thread(mws);
		threads.add(monitorThread);
		for(int i = 0 ; i < concurrentUserNumber; i ++ ) {
//			DummyUser du = new DummyUser(operationNumber, 0, 0, 0, 0, "robot" + i, "http://localhost:8081/cokit/map.jsp");
//			DummyUser du = new DummyUser(operationNumber, 0, 0, 0, 0, "robot" + i, "http://218.193.130.182/cokit/traditionalmap.jsp");
//			DummyUser du = new DummyUser(operationNumber, 0, 0, 0, 0, "robot" + i, "http://218.193.130.182/cokit/clientmap.jsp");
//			Thread thread = new Thread(du);
			
			WebsocketClientSender wcs = new WebsocketClientSender("ws://218.193.130.182", "cokit", "CoKitServer", "robot" + i,
					operationNumber, 0, 0 , 0 , 0, requestFrequency, isAsync);
			
//			WebsocketClientProxy du = new WebsocketClientProxy("ws://localhost:8081", "cokit", "CoKitServer", "robot" + i,
//					operationNumber, 0, 0 , 0 , 0, requestFrequency, false);
//			
//			HttpClientProxy du = new HttpClientProxy("http://localhost:8081", "cokit", "HttpServer", "robot" + i
//					, operationNumber, 0, 0, 0, 0, requestFrequency);
			Thread thread = new Thread(wcs);
			threads.add(thread);
		}
		for(Thread thread : threads) {
			thread.start();
		}
		
	}
}
