package org.cokit.experiment;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.LinkedList;
import java.util.List;
import java.util.logging.Logger;

/**
 * @author dash
 * @version 1.0 date 2017-1-7
 * @since JDK1.6
 */
public class Prometheus {
	List<OperationRunningInformation> oInformations = null;
	
	private static Prometheus singleton = null;
	private Logger logger = null;
	private long interval;
	
	private Prometheus() {
		oInformations = new LinkedList();
		logger = Logger.getLogger(Prometheus.class.getName());
		interval = 1000;
	}
	
	public static Prometheus newInstance() {
		if (singleton == null) {
			synchronized (Prometheus.class) {
				if (singleton == null) {
					singleton = new Prometheus();
				}
			}
		}
		return singleton;
	}

	public static Prometheus getInstance() {
		return singleton;
	}
	
	public synchronized void add(long startTime, long endTime) {
		OperationRunningInformation operationRunningInformation = new OperationRunningInformation(startTime, endTime);
		oInformations.add(operationRunningInformation);
	}
	
	public List<Integer> getOperationPerSecond() {
		List<Integer> secondArray = new LinkedList<Integer>();
		if(oInformations.size() <= 0)
			return secondArray;
		Collections.sort(oInformations);
		long currenTime = oInformations.get(0).getStartTime();
		currenTime += interval; // 1 second interval
		int operationCounter = 0;
		for(OperationRunningInformation ori : oInformations) {
			if(ori.getEndTime() <= currenTime) {
				operationCounter ++;
			} else {
				secondArray.add(operationCounter);
				operationCounter = 1;
				currenTime += interval;
			}
		}
		
		if(operationCounter != 0) {
			secondArray.add(operationCounter);
		}
		return secondArray;
	}
	
	public List<Integer> getOperationArrivedSecond() {
		List<Integer> secondArray = new LinkedList<Integer>();
		if(oInformations.size() <= 0)
			return secondArray;
		Collections.sort(oInformations);
		long currenTime = oInformations.get(0).getStartTime();
		currenTime += interval; // 1 second interval
		int operationCounter = 0;
		for(OperationRunningInformation ori : oInformations) {
			if(ori.getStartTime() <= currenTime) {
				operationCounter ++;
			} else {
				secondArray.add(operationCounter);
				operationCounter = 1;
				currenTime += interval;
			}
		}
		
		if(operationCounter != 0) {
			secondArray.add(operationCounter);
		}
		return secondArray;
	}
	
	public List<Long> getOperationElapseTime() {
		List<Long> elapseArray = new LinkedList<Long>();
		if(oInformations.size() <= 0)
			return elapseArray;
		Collections.sort(oInformations);
		for(OperationRunningInformation ori : oInformations) {
			elapseArray.add(ori.getElapseTime());
		}
		return elapseArray;
	}
	
	
}
