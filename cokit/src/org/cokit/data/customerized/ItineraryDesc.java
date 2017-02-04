package org.cokit.data.customerized;

public class ItineraryDesc {
	private String date;
	private String city;
	private String group;
	private String user;
	
	public ItineraryDesc(String date, String city, String group, String user) {
		super();
		this.date = date;
		this.city = city;
		this.group = group;
		this.user = user;
	}
	
	public String getDate() {
		return date;
	}
	public void setDate(String date) {
		this.date = date;
	}
	public String getCity() {
		return city;
	}
	public void setCity(String city) {
		this.city = city;
	}
	public String getGroup() {
		return group;
	}
	public void setGroup(String group) {
		this.group = group;
	}
	public String getUser() {
		return user;
	}
	public void setUser(String user) {
		this.user = user;
	}
	
	
}
