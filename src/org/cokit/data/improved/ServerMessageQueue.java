package org.cokit.data.improved;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import net.sf.json.JSONObject;

import org.apache.log4j.Logger;
import org.cokit.data.MessageQueue;
import org.cokit.session.SessionHandler;

/**
 * @author dash
 * @version 1.0 date 2017-1-3
 * @since JDK1.6
 */
public class ServerMessageQueue<MessageType> implements MessageQueue<MessageType>{
	
	//the message that waits to be processed
	private int consumerIndex;
	//history information
	private int offse;
	//total number;
	private int size;
		
	//locks
	private Object consumerLock;
	private Object producerLock; 
	
	private static Logger logger = Logger.getLogger(ServerMessageQueue.class);
	List<MessageType> messagequeue = new ArrayList<>();
	
	public ServerMessageQueue() {
		consumerIndex = 0;
		offse = 0;
		size = 0;
		
		consumerLock = new Object();
		producerLock = new Object();
	}
	/**
	 * process user's broadcastMessages, lock 'producerLock' before calling this function
	 * @param message
	 * @return
	 */
	private MessageType processMessage(MessageType message) {
		JSONObject messageJSON = (JSONObject) message;
		JSONObject timestamp = messageJSON.getJSONObject("timestamp");
		
		//complete timestamp
		int globalState = messagequeue.size();
		Date nowDate = new Date();
		String globalClock = String.valueOf(nowDate.getTime());
		timestamp.element("srn", globalState);
		timestamp.element("globalClock", globalClock);
		
		messageJSON.element("timestamp", timestamp);
		return  (MessageType) messageJSON;
	}
	
	@Override
	public void produce(List<MessageType> messages) {
		synchronized (producerLock) {
			for(MessageType message : messages) {
				message = processMessage(message);
				messagequeue.add(message);
				logger.info(message + " is produced"); 
				size++;
			}
			logger.info("total " + messages.size() + " messages are produces");
		}
	}
	
	@Override
	public List<MessageType> consume() {
		List<MessageType> records = new ArrayList<>();
		int size = messagequeue.size();
		synchronized (consumerLock) {
			for(int i = consumerIndex ; i < size; i ++) {
				records.add(messagequeue.get(i));
			}
			consumerIndex = size;
		}
		return records;
	}

	@Override
	public List<MessageType> recall() {
		List<MessageType> records = new ArrayList<>();
		synchronized (consumerLock) {
			for(int i = 0 ; i < consumerIndex; i ++) {
				records.add(messagequeue.get(i));
			}
		}
		return records;
	}

	@Override
	public void freeMessages() {
		synchronized (consumerLock) {
			synchronized (producerLock) {
				for(int i = 0 ; i < consumerIndex; i ++) {
					messagequeue.remove(i);
				}
			}
			offse += consumerIndex;
			consumerIndex = 0;
		}
	}
	
	/**
	 * without lock
	 */
	@Override
	public List<MessageType> getListFromIndex(int index) {
		List<MessageType> records = new ArrayList<>();
		int size = messagequeue.size();
		index -= offse;
		if(index + 1< 0)
			index = -1;
		index  += 1;
//		logger.info("fetch from " + index + " to " + size);
		for(int i = index; i < size; i ++) {
			records.add(messagequeue.get(i));
		}
		return records;
	}
	@Override
	public int getSize() {
		return this.size;
	}

	

}
