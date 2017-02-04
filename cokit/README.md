# cokit
a kit to support real time collaboration

#Environment

tomcat 7.0.73

jdk 1.7 (jre 1.7 at least)

#message format
JSresponse{ 
    action : ""(LOGIN, BROADCAST, SYNCHRONIZATION, OPEN),
    result : ""
    state  : "ok/error"
}

JSrequest{ 
    action : ""(LOGIN, BROADCAST, SYNCHRONIZATION, OPEN),
    cokey : ""
    content  : ""
}