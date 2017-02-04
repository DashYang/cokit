package org.cokit.experiment;

import java.text.DecimalFormat;

import org.openqa.selenium.internal.selenesedriver.GetActiveElement;

/**
 * @author dash
 * @version 1.0 date 2016-12-24
 * @since JDK1.6
 */

public class Parameter {
	private double operationPerSecond = 0.0;
	private double millisecondPerOperation = 0.0;
	private long elapseTime = 0;
	private DecimalFormat df =new DecimalFormat("#####0.00");
	
	public double getOperationPerSecond() {
		return operationPerSecond;
	}

	public void setOperationPerSecond(double operationPerSecond) {
		this.operationPerSecond = operationPerSecond;
	}

	public double getMillisecondPerOperation() {
		return millisecondPerOperation;
	}

	public void setMillisecondPerOperation(double millisecondPerOperation) {
		this.millisecondPerOperation = millisecondPerOperation;
	}

	public Parameter(double operationPerSecond, double millisecondPerOperation) {
		super();
		this.operationPerSecond = operationPerSecond;
		this.millisecondPerOperation = millisecondPerOperation;
	}
	
	public String getOperationPerSecondStr() {
		return df.format(operationPerSecond);
	}
	
	public String getMillisecondPerOperationStr() {
		return df.format(millisecondPerOperation);
	}
	
}
