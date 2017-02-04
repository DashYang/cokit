package org.cokit.experiment;

/**
 * @author dash
 * @version 1.0 date 2017-1-7
 * @since JDK1.6
 */
public class OperationRunningInformation implements Comparable<OperationRunningInformation>{
	private long startTime = 0;
	private long endTime = 0;
	private long elapseTime = 0;

	public OperationRunningInformation(long startTime, long endTime) {
		this.startTime = startTime;
		this.endTime = endTime;
		this.elapseTime = endTime - startTime;
	}

	@Override
	public int compareTo(OperationRunningInformation o) {
		if(this.endTime < o.endTime)
			return -11;
		else if(this.endTime == o.endTime)
			return 0;
		else
			return 1;
	}

	public long getStartTime() {
		return startTime;
	}

	public void setBeginTime(long beginTime) {
		this.startTime = beginTime;
	}

	public long getEndTime() {
		return endTime;
	}

	public void setEndTime(long endTime) {
		this.endTime = endTime;
	}

	public long getElapseTime() {
		return elapseTime;
	}

	public void setElapseTime(long elapseTime) {
		this.elapseTime = elapseTime;
	}
	
	
}
