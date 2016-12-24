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
		int concurrentUserNumber = 4;
		int operationNumber = 100;
		List<Thread> threads = new ArrayList<>();
		for(int i = 0 ; i < concurrentUserNumber; i ++ ) {
//			DummyUser du = new DummyUser(operationNumber, 0, 0, 0, 0, "robot" + i, "http://218.193.130.182/cokit/map.jsp");
//			DummyUser du = new DummyUser(operationNumber, 0, 0, 0, 0, "robot" + i, "http://218.193.130.182/cokit/traditionalmap.jsp");
			DummyUser du = new DummyUser(operationNumber, 0, 0, 0, 0, "robot" + i, "http://218.193.130.182/cokit/clientmap.jsp");
			Thread thread = new Thread(du);
			threads.add(thread);
		}
		
		for(Thread thread : threads) {
			thread.start();
		}
	}
}
