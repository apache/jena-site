---
title: Fuseki Logging
---

Fuseki logs operation details and also provides a standard NCSA request log.  

Logging is via [SLF4J](http://slf4j.org/) over 
[Apache Log4J2](http://logging.apache.org/log4j/2.x/), or by
the Tomcat configuration if running the WAR file.


| Full Log name                   | Usage |
|---------------                  |-------|
| org.apache.jena.fuseki.Server   | General Server Messages              |
| org.apache.jena.fuseki.Request  | NCSA request Log                     |
| org.apache.jena.fuseki.Fuseki   | The HTTP request log                 |
| org.apache.jena.fuseki.Admin    | Administration operations            |
| org.apache.jena.fuseki.Builder  | Dataset and service build operations |
| org.apache.jena.fuseki.Config   | Configuration                        |

## NCSA request Log

This log is in NCSA extended/combined log format.  
Many web log analysers can process this format.

This log is normally off.
The logger name is `org.apache.jena.fuseki.Request`.

When run as a WAR file inside a webapp container 
(e.g. [Apache Tomcat](http://tomcat.apache.org/)), the webapp container
or reverse proxy will log access requests anyway. 

## Setting logging

The Fuseki Main engine looks for the log4j2 configuration as follows:

* Use system property `log4j2.configurationFile` if defined ([as usual for log4j2](https://logging.apache.org/log4j/2.x/manual/configuration.html)).
* Use `file:log4j2.properties` (current directory) if it exists
* Use java resource `log4j2.properties` on the classpath.
* Use java resource `org/apache/jena/fuseki/log4j2.properties` on the classpath.
* Use a built-in configuration.

The last step is a fallback to catch the case where Fuseki has been repackaged
into a new WAR file and `org/apache/jena/fuseki/log4j2.properties` omitted, or run from
the base jar.  It is better to include `org/apache/jena/fuseki/log4j2.properties`.

The preferred customization is to use a custom `log4j2.properties` file in the
directory where Fuseki Main is run.

For the war file packaging, the `log4j2.properties` should go in `FUSEKI_BASE`
which defaults to `/etc/fuseki` on Linux.

For the standalone webapp server, `FUSEKI_BASE` defaults to directory `run/`
within the directory where the server is run.

The property `fuseki.loglogging` can also be set to `true` for additional logging.

## Setting ARQ explain logging

Query explanation can be turned on by setting the symbol `arq:optReorderBGP` in the context
to "info", "fine" or "all". This can be done in the Assembler file by setting `ja:context` 
on the server, dataset, or endpoint:

    [] ja:context [ ja:cxtName "arq:logExec" ;  ja:cxtValue "info" ] .

## Default setting

The [default log4j2.properties](https://github.com/apache/jena/blob/main/jena-fuseki2/apache-jena-fuseki/log4j2.properties).

## Logrotate

Below is an example logrotate(1) configuration (to go in `/etc/logrotate.d`)
assuming the log file has been put in `/etc/fuseki/logs/fuseki.log`.

It rotates the logs once a month, compresses logs on rotation, and keeps them for 6 months.

It uses `copytruncate`.  This may lead to at most one broken log file line.

    /etc/fuseki/logs/fuseki.log
    {
        compress
        monthly
        rotate 6
        create
        missingok
        copytruncate
        # Date in extension.
        dateext
        # No need
        # delaycompress
    }
