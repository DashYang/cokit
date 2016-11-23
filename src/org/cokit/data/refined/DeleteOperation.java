package org.cokit.data.refined;

public class DeleteOperation {
	private String identifier;
	
	public DeleteOperation(String position) {
		super();
		this.identifier = position;
	}

	public String getPosition() {
		return identifier;
	}

	public void setPosition(String position) {
		this.identifier = position;
	}
	
	
}
