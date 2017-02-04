package org.cokit.server;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.Date;
import java.util.LinkedList;
import java.util.List;
import java.util.Vector;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import net.sf.json.JSONArray;
import net.sf.json.JSONObject;

import org.apache.log4j.Logger;
import org.cokit.data.ActionType;
import org.cokit.experiment.Parameter;
import org.cokit.session.SessionHandler;
import org.cokit.session.SessionPool;

/**
 * Servlet implementation class HttpServer
 */
@WebServlet("/HttpServer")
public class HttpServer extends HttpServlet {
	private static final long serialVersionUID = 1L;

	private SessionPool sessionPool = null;
	private static final Logger logger = Logger.getLogger(WebSocketServer.class
			.getName());

	/**
	 * server throughput rate experiment
	 */
	private AtomicLong totalExecuteTime = new AtomicLong(0);
	private AtomicInteger totalRequestNumber = new AtomicInteger(0);
	private static final List<Parameter> experimentResult = new Vector<Parameter>();

	/**
	 * @see HttpServlet#HttpServlet()
	 */
	public HttpServer() {
		super();
		// TODO Auto-generated constructor stub
	}

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse
	 *      response)
	 */
	protected void doGet(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {
		// experiment begin
		long startTime = new Date().getTime();
		boolean effectiveOperationFlag = false;
		// extract identified information from JSON Message
		JSONObject messageJSON = JSONObject.fromObject(request.getParameter("message"));
		if(messageJSON == null)
			return;
		// extract identified information from JSON Message
		String sessionId = request.getParameter("sessionId");
		String cokey = messageJSON.getString("cokey");
		String action = messageJSON.getString("action");
		// important information misses, ignore
		if (cokey == null || action == null) {
			logger.info("unrecognized type of message, ignore..." + messageJSON.toString());
			return;
		}

		this.sessionPool = SessionPool.newInstance();
		sessionPool.addSessionHandler(cokey);

		JSONObject timestampJSON = null;
		SessionHandler sessionHandler = null;
		JSONObject resultJSON = new JSONObject();
		resultJSON.element("state", "ok");
		switch (ActionType.valueOf(action)) {
		case LOGIN:
			// old session
			logger.info("user " + sessionId + " login " + cokey);
			resultJSON.element("type", "LOGIN");
			resultJSON.element("result", "sucess");
			break;
		case SYNCHRONIZATION:
			// create sessionHandler for cokey
			sessionHandler = sessionPool.getSessionHandler(cokey);
			
			// server completer timestamp
			timestampJSON = messageJSON.getJSONObject("timestamp");
			int lastUpdateSRN = timestampJSON.getInt("lastUpdateSRN");
			logger.info(sessionHandler.toString() + " handles this request");
			// fetch history message records
			if (messageJSON.getJSONObject("refinedOperation") != null
					&& !messageJSON.getJSONObject("refinedOperation")
							.toString().equals("null")) {
				sessionHandler.saveMessage(messageJSON);
				effectiveOperationFlag = true;
				// thread)
			}
			List<JSONObject> histroyRecords = sessionHandler
					.synchronizeMessages(lastUpdateSRN);
			resultJSON.element("type", "SYNCHRONIZATION");
			resultJSON.element("size", histroyRecords.size());
			resultJSON.element("result", histroyRecords.toString());
			
			break;
		case EXPERIMENTRESULT:
			resultJSON.element("type", "EXPERIMENTRESULT");
			resultJSON.element("result", replyExperimentResult());
			break;
		default:
			resultJSON.element("state", "unknown");
			resultJSON.element("type", "UNRECOGNIZED");
			resultJSON.element("result", "unrecognized type of message, ignore " + messageJSON.toString());
			logger.info("unrecognized type of message, ignore " + messageJSON.toString());
			break;
		}
		
		PrintWriter pw = response.getWriter();
		pw.print(resultJSON.toString());
		pw.close();
		
		if(effectiveOperationFlag == true)
			checkExperimentResult(startTime);
	}

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse
	 *      response)
	 */
	protected void doPost(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {
		this.doGet(request, response);
	}
	
	
	public String replyExperimentResult() {
		JSONArray listJSONArray = new JSONArray();
		List<String> opsList = new LinkedList();
		List<String> mspoList = new LinkedList();
		logger.info("experiment size " + experimentResult.size());
		for(Parameter parameter : experimentResult) {
			JSONObject parameterJson = new JSONObject();
			String ops = parameter.getOperationPerSecondStr();
			String mspo = parameter.getMillisecondPerOperationStr();
			opsList.add(ops);
			mspoList.add(mspo);
			parameterJson.element("ops", ops);
			parameterJson.element("mspo", mspo);
		}
		logger.info(opsList);
		logger.info(mspoList);
		listJSONArray.add(opsList);
		listJSONArray.add(mspoList);
		
		return listJSONArray.toString();
	}
	
	private void checkExperimentResult(long startTime) {
		//experiment end
		long endTime = new Date().getTime();
		if (endTime - startTime >= 0) {
			long differential = endTime - startTime; 
			totalRequestNumber.incrementAndGet();
			totalExecuteTime.set(totalExecuteTime.get() + endTime - startTime);
			double operationPerSecond = 1000.0 * totalRequestNumber.get()
					/ totalExecuteTime.get();
			double millisecondPerOperation = 1.0 * totalExecuteTime.get()
					/ totalRequestNumber.get();
			Parameter parameter = new Parameter(operationPerSecond, millisecondPerOperation);
			experimentResult.add(parameter);
			logger.info(totalRequestNumber.get() + " " + totalExecuteTime.get() + " " + differential);
		}
	}
}
