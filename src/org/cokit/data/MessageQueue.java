package org.cokit.data;

import java.util.List;

/**
 * a message queue interface to handle the message receive and send.
 * basic operations
 * @author dash
 * @version 1.0 date 2017-1-3
 * @since JDK1.6
 */
public interface MessageQueue<MessageType> {
	
	public void produce(List<MessageType> messages);
	
	public List<MessageType> consume();
	
	public List<MessageType> recall();
	
	public List<MessageType> getListFromIndex(int index);
	
	public void freeMessages();
	
	public int getSize();
}
