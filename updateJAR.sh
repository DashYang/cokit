#!/bin/sh

mvn dependency:copy-dependencies -DoutputDirectory=WebContent/WEB-INF/lib/ -DincludeScope=runtime
