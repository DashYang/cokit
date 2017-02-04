package org.cokit.data;

import java.util.UUID;

/**
 * 
 * @author dash
 * 
 *
 */
public class SessionId<Description> {
	private String cokey;              //every session has a different cokey.
	private Description description;             //
	
	public SessionId(Description description) {
		this.description = description;
		
		cokey = UUID.randomUUID().toString().trim().replaceAll("-", "");
	}

	public String getCokey() {
		return cokey;
	}

	public void setCokey(String cokey) {
		this.cokey = cokey;
	}

	public Description getDescription() {
		return description;
	}

	public void setDescription(Description description) {
		this.description = description;
	}
	
}
