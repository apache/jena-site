---
title: ARQ - Logging
---

ARQ uses
[SLF4j](http://slf4j.org/)
as the logging API and the query and RIOT commands use
[Log4J2](http://logging.apache.org/log4j/2.x/) as a deployment
system.  You can use Java 1.4 logging instead.

ARQ does not output any logging messages at level INFO in normal
operation. The code uses level TRACE and DEBUG.  Running with
logging set to an application at INFO will cause no output in
normal operation. Output below INFO can be very verbose and is
intended mainly to help debug ARQ. WARN and FATAL messages are only
used when something is wrong.

The root of all the loggers is `org.apache.jena`.
`org.apache.jena.query` is the application API. 
`org.apache.jena.sparql` is the implementation and extensions
points.

If using in Tomcat, or other system that provides complex class
loading arrangements, be careful about loading from jars in both
the web application and the system directories as this can cause
separate logging systems to be created (this may not matter).

The ARQ and RIOT command line utilities look for a file
"log4j2.properties" in the current directory to control logging during
command execution. There is also a built-in configuration so no
configuration work is required.


Logger Names | Name | Constant | Logger | Use
------------ | ---- | -------- | ------ | ---
`org.apache.jena.arq.info` | `ARQ.logInfoName` | `ARQ.getLoggerInfo()` | General information
`org.apache.jena.arq.exec` | `ARQ.logExecName` | `ARQ.getLoggerExec()` | Execution information

The reading of `log4j.properties` from the current directory is achieved
by a call to `org.apache.jena.atlas.logging.Log.setlog4j2()`.

Example `log4j2.properties` file:

```
status = error
name = PropertiesConfig
filters = threshold

filter.threshold.type = ThresholdFilter
filter.threshold.level = INFO

appender.console.type = Console
appender.console.name = STDOUT
appender.console.layout.type = PatternLayout
appender.console.layout.pattern = %d{HH:mm:ss} %-5p %-15c{1} :: %m%n

rootLogger.level                  = INFO
rootLogger.appenderRef.stdout.ref = STDOUT

logger.jena.name  = org.apache.jena
logger.jena.level = INFO

logger.arq-exec.name  = org.apache.jena.arq.exec
logger.arq-exec.level = INFO

logger.arq-info.name  = org.apache.jena.arq.exec
logger.arq-info.level = INFO

logger.riot.name  = org.apache.jena.riot
logger.riot.level = INFO
```
A [Fuseki](../serving/data/index.html)
server output can include [ARQ execution logging](explain.html "ARQ/Explain").

## Execution Logging

ARQ can log query and update execution details globally or for an
individual operations. This adds another level of control on top of the
logger level controls.

Explanatory messages are controlled by the `Explain.InfoLevel` level in
the execution context.

The logger used is called `org.apache.jena.arq.exec`. Message are sent
at level "info". So for log4j2, the following can be set in the
log4j2.properties file:

    logger.arq-exec.name  = org.apache.jena.arq.exec
    logger.arq-exec.level = INFO

The context setting is for key (Java constant) `ARQ.symLogExec`. To set
globally:

    ARQ.setExecutionLogging(Explain.InfoLevel.ALL) ;

and it may also be set on an individual query execution using its local
context.

     try(QueryExecution qExec = QueryExecution.create()... .set(ARQ.symLogExec, Explain.InfoLevel.ALL).build) {
        ...
     }

On the command line:

     arq.query --explain --data data file --query=queryfile

The command `tdbquery` takes the same `--explain` argument.

**Information levels**

Level | Effect
----- | ------
INFO | Log each query  |
FINE | Log each query and its algebra form after optimization
ALL | Log query, algebra and every dataset access (can be expensive)
NONE | No information logged

These can be specified as string, to the command line tools, or using
the constants in `Explain.InfoLevel`.

     qExec.getContext().set(ARQ.symLogExec, Explain.InfoLevel.FINE) ;

     arq.query --set arq:logExec=FINE --data data file --query=queryfile


[ARQ documentation index](index.html)
