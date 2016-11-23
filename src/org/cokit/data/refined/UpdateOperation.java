package org.cokit.data.refined;

public class UpdateOperation<Data> {
	private String identifier;
	private Data data;
	
	public UpdateOperation(String position, Data data) {
		this.identifier = position;
		this.data = data;
	}

	public String getPosition() {
		return identifier;
	}

	public void setPosition(String position) {
		this.identifier = position;
	}

	public Data getData() {
		return data;
	}

	public void setData(Data data) {
		this.data = data;
	}
}
