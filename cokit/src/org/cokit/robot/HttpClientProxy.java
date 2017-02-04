package org.cokit.robot;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.net.URL;
import java.net.URLConnection;
import java.util.Date;

import javax.websocket.Session;

import net.sf.json.JSONObject;

import org.cokit.data.Timestamp;
import org.cokit.data.customerized.POI;
import org.cokit.data.improved.Operation;
import org.eclipse.jdt.internal.compiler.ast.ThisReference;

/**
 * dummy user(Http request)
 * @author dash
 * @version 1.0 date 2017-1-7
 * @since JDK1.6
 */
public class HttpClientProxy implements Runnable{
	private String url = "http://localhost:8081";
	private String project = "cokit";
	private String service = "HttpServer";
	private String username = "robot";
	
	private int addPOI = 10;
	private int addLine = 10;
	private int updatePOI = 25;
	private int deletePOI = 3;
	private int deleteLine = 2;
	
	private String cokey = "itinerary-planning-client";
	private int frequency = 100;
	
	public HttpClientProxy(String url, String project, String service,
			String username, int addPOI, int addLine, int updatePOI,
			int deletePOI, int deleteLine, int frequency) {
		super();
		this.url = url;
		this.project = project;
		this.service = service;
		this.username = username;
		this.addPOI = addPOI;
		this.addLine = addLine;
		this.updatePOI = updatePOI;
		this.deletePOI = deletePOI;
		this.deleteLine = deleteLine;
		this.frequency = frequency;
	}

	@Override
	public void run() {
		addPOI();
	}
	
	
	 private String sendPost(String url, String param) {
	        PrintWriter out = null;
	        BufferedReader in = null;
	        String result = "";
	        try {
	            URL realUrl = new URL(url);
	            URLConnection conn = realUrl.openConnection();
	            conn.setRequestProperty("accept", "*/*");
	            conn.setRequestProperty("connection", "Keep-Alive");
	            conn.setRequestProperty("user-agent",
	                    "Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1;SV1)");
	            conn.setDoOutput(true);
	            conn.setDoInput(true);
	            out = new PrintWriter(conn.getOutputStream());
	            out.print(param);
	            out.flush();
	            in = new BufferedReader(
	                    new InputStreamReader(conn.getInputStream()));
	            String line;
	            while ((line = in.readLine()) != null) {
	                result += line;
	            }
	        } catch (Exception e) {
	           System.out.println("unexpeceted error happens "+e);
	            e.printStackTrace();
	        }
	        finally{
	            try{
	                if(out!=null){
	                    out.close();
	                }
	                if(in!=null){
	                    in.close();
	                }
	            }
	            catch(IOException ex){
	                ex.printStackTrace();
	            }
	        }
	        return result;
	    }    
	 
	 private void sleep(int interval) {
			try {
				Thread.sleep(interval);
			} catch (InterruptedException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
		}
	 
	private void addPOI(){
		/**
		 * operations
		 */
		for(int i = 0 ; i < addPOI ; i ++) {
			long currentTime = new Date().getTime();
			Timestamp timestamp = new Timestamp(-1, i, username, -1, currentTime, currentTime);
			Operation<POI> operation = new Operation("0", null, "addPOI");
			JSONObject message = new JSONObject();
			message.element("refinedOperation", operation.writeToJSON());
			message.element("timestamp", timestamp.writeToJSON());
			message.element("cokey", cokey);
			message.element("action", "SYNCHRONIZATION");
			
			JSONObject httpMessage = new JSONObject();
			String postMessage = "message=" + message + "&sessionId=" + username;
			
			String requestURL = url + "/" + project + "/" + service;
			sendPost(requestURL, postMessage.toString());
			
			sleep(frequency);
		}
	}
	
}
