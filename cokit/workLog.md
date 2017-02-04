#Work Log

##2017.01.23
用IDEA配置环境需要注意，在ubuntu下导入JDK似乎只能导入1.6.
然而该项目中的websocket依赖jre1.7，否则websocket连接会报
404错误。需要在配置Tomcat服务器的时候指定JRE为1.7

##2017.01.25
重构ASTEngine,basicData和historybuffer

##2017.01.29
torder和happenedbefore去除localhistorybuffer的尝试,理论上js的浅拷贝特性(引用)可以完成

##2017.02.03
torder和reflect应不应该开放修改,感觉reflect可以,torder需要仔细考虑