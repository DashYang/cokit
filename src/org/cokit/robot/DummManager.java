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
		int concurrentUserNumber = 1;
		List<Thread> threads = new ArrayList<>();
		for(int i = 0 ; i < concurrentUserNumber; i ++ ) {
//			DummyUser du = new DummyUser(50, 0, 0, 0, 0, "robot" + i, "http://localhost:8081/cokit/map.jsp");
			DummyUser du = new DummyUser(10, 0, 0, 0, 0, "robot" + i, "http://localhost:8081/cokit/traditionalmap.jsp");
			Thread thread = new Thread(du);
			threads.add(thread);
		}
		
		for(Thread thread : threads) {
			thread.start();
		}
	}
}
