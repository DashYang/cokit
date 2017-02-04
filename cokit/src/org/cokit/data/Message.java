package org.cokit.data;

public class Message<Description, Operation> {
	private String cokey;
	private Description description;
	private Operation operation;
	private Timestamp timestamp;
	
	public Message(String cokey, Description description,
			Operation operation, Timestamp timestamp) {
		super();
		this.cokey = cokey;
		this.description = description;
		this.operation = operation;
		this.timestamp = timestamp;
	}
	
	public String getSessionId() {
		return cokey;
	}
	public void setSessionId(String cokey) {
		this.cokey = cokey;
	}
	public Description getDescription() {
		return description;
	}
	public void setDescription(Description description) {
		this.description = description;
	}
	public Operation getOperation() {
		return operation;
	}
	public void setOperation(Operation operation) {
		this.operation = operation;
	}

	public Timestamp getTimestamp() {
		return timestamp;
	}

	public void setTimestamp(Timestamp timestamp) {
		this.timestamp = timestamp;
	}
	
	
}
