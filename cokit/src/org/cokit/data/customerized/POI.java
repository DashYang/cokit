package org.cokit.data.customerized;

/**
 * 
 * @author dash
 * APP data type
 */

public class POI {
	private String title;
	private String content;
	private String latlng;
	
	public POI(String title, String content, String latlng) {
		super();
		this.title = title;
		this.content = content;
		this.latlng = latlng;
	}
	public String getTitle() {
		return title;
	}
	public void setTitle(String title) {
		this.title = title;
	}
	public String getContent() {
		return content;
	}
	public void setContent(String content) {
		this.content = content;
	}
	public String getLatlng() {
		return latlng;
	}
	public void setLatlng(String latlng) {
		this.latlng = latlng;
	}
	
	
}
