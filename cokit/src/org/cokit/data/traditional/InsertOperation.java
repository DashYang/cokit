package org.cokit.data.traditional;

public class InsertOperation<Data> {
	private int position;
	private Data data;
	
	public InsertOperation(int position, Data data) {
		this.position = position;
		this.data = data;
	}

	public int getPosition() {
		return position;
	}

	public void setPosition(int position) {
		this.position = position;
	}

	public Data getData() {
		return data;
	}

	public void setData(Data data) {
		this.data = data;
	}
	
	
}
