package org.cokit.data.improved;

import net.sf.json.JSONObject;

public class Operation<Data> {
	private String identifier;
	private Data data;
	private String type;
	
	public Operation(String identifier, Data data, String type) {
		super();
		this.identifier = identifier;
		this.data = data;
		this.type = type;
	}
	
	public JSONObject writeToJSON() {
		JSONObject operationJSON = new JSONObject();
		
		operationJSON.element("identifier", identifier);
		operationJSON.element("data", data);
		operationJSON.element("type", type);
		
		return operationJSON;
	}
	
	public Operation(String position, Data data) {
		this.identifier = position;
		this.data = data;
	}
	
	public Data getData() {
		return data;
	}

	public void setData(Data data) {
		this.data = data;
	}

	public String getIdentifier() {
		return identifier;
	}

	public void setIdentifier(String identifier) {
		this.identifier = identifier;
	}

	public String getType() {
		return type;
	}

	public void setType(String type) {
		this.type = type;
	}
	
	
}
