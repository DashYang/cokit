package org.cokit.server;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import javax.websocket.OnClose;
import javax.websocket.OnMessage;
import javax.websocket.OnOpen;
import javax.websocket.Session;
import javax.websocket.server.ServerEndpoint;

import net.sf.json.JSONArray;
import org.apache.log4j.Logger;
import org.cokit.data.ActionType;
import org.cokit.experiment.Prometheus;
import org.cokit.session.SessionHandler;
import org.cokit.session.SessionPool;

import net.sf.json.JSONObject;

/**
 * Servlet implementation class WebSocketServer to handle client's request
 */
@ServerEndpoint(value = "/CoKitServer")
public class WebSocketServer {
    private SessionPool sessionPool = null; //handle session
    private Prometheus prometheus = null;   //experiment

    private static final Logger logger = Logger.getLogger(WebSocketServer.class
            .getName());

    /**
     * @OnOpen allows us to intercept the creation of a new session. The session
     * class allows us to send data to the user. In the method onOpen,
     * we'll let the user know that the handshake was successful.
     */
    @OnOpen
    public void onOpen(Session session) {
        logger.info(session.getId() + " has opened a connection");
        try {
            JSONObject resultJSON = new JSONObject();
            resultJSON.element("action", "OPEN");
            resultJSON.element("result", "Connection Established");
            session.getBasicRemote().sendText(resultJSON.toString());
        } catch (IOException ex) {
            ex.printStackTrace();
        }
    }

    /**
     * When a user sends a message to the server, this method will intercept the
     * message and allow us to react to it. For now the message is read as a
     * String.
     * return message format include state, action, result
     */
    @OnMessage
    public void onMessage(String message, Session session) {
        //experiment begin
        long startTime = new Date().getTime();
        long endTime = startTime;
//		logger.info("Message from " + session.getId() + ": " + message);
        JSONObject messageJSON = JSONObject.fromObject(message);

        // extract identified information from JSON Message
        String sessionId = session.getId();
        String cokey = messageJSON.getString("cokey");
        String action = messageJSON.getString("action");

        // important information misses, ignore
        if (cokey == null || action == null) {
            logger.info("unrecognized type of message, ignore..." + message);
            return;
        }

        this.sessionPool = SessionPool.newInstance();
        this.prometheus = Prometheus.newInstance();

        sessionPool.addSessionHandler(cokey);

        JSONObject timestampJSON = null;
        SessionHandler sessionHandler = null;
        switch (ActionType.valueOf(action)) {
            case LOGIN:
                // old session
                sessionHandler = sessionPool.getSessionHandler(cokey);
                sessionHandler.addSession(sessionId, session);
                break;
            case BROADCAST:
                // create sessionHandler for cokey
                sessionHandler = sessionPool.getSessionHandler(cokey);
			    logger.info(sessionHandler.toString() + " handles this BROADCAST request");

                // avoid the disorder of broadcasting messages
                JSONArray messageList = messageJSON.getJSONArray("content");
                sessionHandler.saveMessages(messageList);
                sessionHandler.broadcastOperationsToAll();

                endTime = new Date().getTime();
                prometheus.add(startTime, endTime);
                break;
            case FETCH:
                sessionHandler = sessionPool.getSessionHandler(cokey);
                logger.info(sessionHandler.toString() + " handles this FETCH request");

                sessionHandler.broadcastOperationsToAll();
                break;
            case SYNCHRONIZATION:
                // create sessionHandler for cokey
                boolean isEmpty = true;
                sessionHandler = sessionPool.getSessionHandler(cokey);
                logger.info(sessionHandler.toString() + " handles this request");

                timestampJSON = messageJSON.getJSONObject("timestamp");
                int lastUpdateSRN = timestampJSON.getInt("lastUpdateSRN");

                // fetch history message records
                if (messageJSON.getJSONObject("refinedOperation") != null
                        && !messageJSON.getJSONObject("refinedOperation")
                        .toString().equals("null")) {
                    // server completer timestamp
                    sessionHandler.saveMessage(messageJSON);
                    isEmpty = false;
                    // thread)
                }
                List<JSONObject> histroyRecords = sessionHandler
                        .synchronizeMessages(lastUpdateSRN);

                int currentIndex = 0;
                int interval = 10, size = histroyRecords.size();
                while (currentIndex < size) {
                    JSONObject resultJSON = new JSONObject();
                    resultJSON.element("state", "OK");
                    resultJSON.element("action", "SYNCHRONIZATION");
                    int step = (currentIndex + interval > size) ? (size - currentIndex) : (interval);
                    resultJSON.element("result", histroyRecords.subList(currentIndex, currentIndex + step));
                    reply(session, resultJSON);
                    currentIndex += interval;
                }
                //only not empty operation should consider
                if (isEmpty == false) {
                    endTime = new Date().getTime();
                    prometheus.add(startTime, endTime);
                }
                break;
            case EXPERIMENTRESULT:
                replyExperimentResult(session);
                break;
            case SERVERPERFORMANCE:
                logger.info("evaluate server's performance begin");
                sessionHandler = sessionPool.getSessionHandler(cokey);
                int number = messageJSON.getInt("number");
                long beginTimer = System.currentTimeMillis();
                List<Long> saveTimeList = new ArrayList<Long>();
                for (int i = 0; i < number; i++) {
                    sessionHandler.saveMessage(messageJSON);
                    long endTimer = System.currentTimeMillis();
                    saveTimeList.add(endTimer - beginTimer);
                }
                currentIndex = 0;
                interval = 1000;
                size = saveTimeList.size();
                while (currentIndex < size) {
                    JSONObject resultJSON = new JSONObject();
                    resultJSON.element("state", "OK");
                    resultJSON.element("action", "SERVERPERFORMANCE");
                    int step = (currentIndex + interval > size) ? (size - currentIndex) : (interval);
                    resultJSON.element("result", saveTimeList.subList(currentIndex, currentIndex + step));
                    reply(session, resultJSON);
                    currentIndex += interval;
                }
                logger.info("evaluate server's performance end");
                break;
            default:
                logger.info("unrecognized type of message, ignore " + message);
                break;
        }


    }

    public void reply(Session requester, JSONObject result) {
        try {
//			logger.info("reply " + result.toString());
            requester.getBasicRemote().sendText(result.toString());
        } catch (IOException e) {
            logger.info("requester " + requester.getId()
                    + " meets unexpected error, records are "
                    + result.toString());
            e.printStackTrace();
        }
    }

    public void replyExperimentResult(Session requester) {
        JSONObject resultJSON = new JSONObject();
        List<Integer> opsList = prometheus.getOperationPerSecond();
        List<Long> mspoList = prometheus.getOperationElapseTime();
        List<Integer> arriveOpList = prometheus.getOperationArrivedSecond();

        logger.info(opsList);
        logger.info(mspoList);
        logger.info(arriveOpList);

        resultJSON.element("state", "EXPERIMENTRESULT");
        resultJSON.element("action", "EXPERIMENTRESULT");
        resultJSON.element("OperationPerSecond", opsList);
        resultJSON.element("OperationArrivedSecond", arriveOpList);

        try {
            logger.info("reply \n" + resultJSON.toString());
            requester.getBasicRemote().sendText(resultJSON.toString());
        } catch (IOException e) {
            logger.info("requester " + requester.getId()
                    + " meets unexpected error, records are "
                    + resultJSON.toString());
            e.printStackTrace();
        }
    }

    /**
     * The user closes the connection.
     * <p>
     * Note: you can't send messages to the client from this method
     */
    @OnClose
    public void onClose(Session session) {
        logger.warn("Session " + session.getId() + " has ended");
    }

}
