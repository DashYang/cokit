package org.cokit.robot;

import java.util.ArrayList;
import java.util.List;

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
			DummyUser du = new DummyUser(20, 5, 0, 0, 0, "robot" + i, "http://localhost:8081/cokit/map.jsp");
			Thread thread = new Thread(du);
			threads.add(thread);
		}
		
		for(Thread thread : threads) {
			thread.start();
		}
	}
}
