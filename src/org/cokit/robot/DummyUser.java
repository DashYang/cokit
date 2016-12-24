package org.cokit.robot;

import java.util.List;
import java.util.Random;
import java.util.concurrent.TimeUnit;

import org.apache.log4j.Level;
import org.apache.log4j.Logger;
import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;

/**
 * @author dash
 * @version 1.0 date 2016-12-17
 * @since JDK1.6
 */
public class DummyUser implements Runnable{
	private WebDriver driver;
	private String POIList[] = {"东方明珠", "外滩", "上海野生动物园", "上海科技馆", "豫园", "田子坊",
			"上海环球金融中心", "南京路步行街", "欢乐谷", "上海杜莎夫人蜡像馆", "上海博物馆", "新天地", "人民广场",
			"城隍庙旅游区", "上海动物园" };

	private int addPOI = 10;
	private int addLine = 10;
	private int updatePOI = 25;
	private int deletePOI = 3;
	private int deleteLine = 2;
	
	private String user = "unknown";
	private String url = "unknown";
	private int sleepTime = 10;
	private Logger logger = Logger.getLogger(this.getClass());
	
	public DummyUser(int addPOI, int addLine, int updatePOI, int deletePOI,
			int deleteLine, String user, String url) {
		super();
		this.addPOI = addPOI;
		this.addLine = addLine;
		this.updatePOI = updatePOI;
		this.deletePOI = deletePOI;
		this.deleteLine = deleteLine;
		this.setUser(user);
		
		String completeUrl = url + "?user=" + user;
		System.setProperty("webdriver.chrome.driver",
				"C:/Users/dash/Downloads/chromedriver_win32/chromedriver.exe");
		driver = new ChromeDriver();
		logger.setLevel(Level.INFO);
		System.out.println("fetchURL " + completeUrl);
		driver.get(completeUrl);
	}

	private void sleep(int interval) {
		try {
			Thread.sleep(interval);
		} catch (InterruptedException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}

	public void run() {
		driver.manage().timeouts().implicitlyWait(3, TimeUnit.SECONDS);
		for (int i = 0; i < addPOI; i++) {
			appendPOI();
			logger.info("execute the " + i + " operation");
			sleep(sleepTime);
		}
		for (int i = 0; i < addLine; i++) {
			try{
				connect();
			}catch(Exception e){
				e.printStackTrace();
			}
			sleep(sleepTime);
		}
		for (int i = 0; i < updatePOI; i++) {
			try{
				update();
			}catch(Exception e){
				e.printStackTrace();
			}
			sleep(sleepTime);
		}
		for (int i = 0; i < deletePOI; i++) {
			try{
				deletePOI();
			}catch(Exception e){
				e.printStackTrace();
			}
			sleep(1000);
		}
		for (int i = 0; i < deleteLine; i++) {
			try {
				disConnect();
				sleep(sleepTime);
			} catch (Exception e) {
				e.printStackTrace();
			}
		}

		sleep(sleepTime);

	}

	private void appendPOI() {
		String exstr = String.format("addPOI('%s', '%s', '%s\')", "0", "fudan", "addPOI");
		logger.info(exstr);
		((JavascriptExecutor)driver).executeScript(exstr);
	}

	private void deletePOI() {
		Random random = new Random();
		List<WebElement> deleteButtons = driver.findElements(By
				.cssSelector(".deletePOIbutton"));
		int TabIndex = random.nextInt(deleteButtons.size());
		
		WebElement deleteButton = deleteButtons.get(TabIndex);
		String targetId = deleteButton.getAttribute("id").substring(1);
		String exstr = String.format("deletePOI('%s')", targetId);
		((JavascriptExecutor)driver).executeScript(exstr);
	}

	private void connect() {
		Random random = new Random();
		List<WebElement> connectButtons = driver.findElements(By
				.cssSelector(".connectPOIbutton"));
		int size = connectButtons.size();
		if (size < 2)
			return;
		
		int startIndex = random.nextInt(size - 1);
		int endIndex = random.nextInt(size - startIndex - 1) + startIndex + 1;

		WebElement startPOI = connectButtons.get(startIndex);
		WebElement endPOI = connectButtons.get(endIndex);
		
		String startId = startPOI.getAttribute("id").substring(1);
		String endId = endPOI.getAttribute("id").substring(1);
		
		String jsstr = String.format("connect('%s', '%s', '%s', '%s', '%s')","0",startId,endId, "connect", "");
		JavascriptExecutor js = (JavascriptExecutor) driver;
		js.executeScript(jsstr);
	}

	private void disConnect() {
		Random random = new Random();
		List<WebElement> deleteButtons = driver.findElements(By
				.cssSelector(".deleteEdgebutton"));
		int TabIndex = random.nextInt(deleteButtons.size());
		
		WebElement deleteButton = deleteButtons.get(TabIndex);
		String targetId = deleteButton.getAttribute("id").substring(1);
		String exstr = String.format("disconnect('%s')", targetId);
		((JavascriptExecutor)driver).executeScript(exstr);
		
	}

	private void update() {
		Random random = new Random();
		List<WebElement> updateButton = driver.findElements(By
				.cssSelector(".updatePOIbutton"));
		int TabIndex = random.nextInt(updateButton.size());
		
		WebElement deleteButton = updateButton.get(TabIndex);
		String targetId = deleteButton.getAttribute("id").substring(1);
		String exstr = String.format("updatePOI('%s', '%s')", targetId, "update");
		((JavascriptExecutor)driver).executeScript(exstr);
	}

	public String getUser() {
		return user;
	}

	public void setUser(String user) {
		this.user = user;
	}

	public String getUrl() {
		return url;
	}

	public void setUrl(String url) {
		this.url = url;
	}
}
