---
title: Fuseki Quickstart
---

This page describes how to achieve certain common tasks in the most direct way possible.

## Running with Apache Tomcat and loading a file.

1. Unpack the distribution.
2. Copy the WAR file into the Apache tomcat webapp directory, under the name 'fuseki'
3. If the user under which Apache tomcat is running does not have write access to `/etc`, then please make sure to set the environment variable FUSEKI_BASE, whereas the value should be a directory where the user running Apache tomcat is able to write to.
4. In a browser, go to `[http://localhost:8080/fuseki/](http://localhost:8080/fuseki)` (details such as port number depend on the Tomcat setup).
5. Click on "Add one", choose "in-memory", choose a name for the URL for the dataset.
6. Go to "add data" and load the file (single graph).

## Publish an RDF file as a SPARQL endpoint.

1. Unpack the distribution.
2. Run `fuseki-server --file FILE /name`

## Explore a TDB database

1. Unpack the distribution.
2. Run `fuseki-server --loc=DATABASE /name`
3. In a browser, go to `http://localhost:3030//query.html`

More details on running Fuseki can be found [nearby](fuseki-webapp.html),
including running as an operating system service and in a web app or
servlet container such as [Apache Tomcat](http://tomcat.apache.org/) or
[Jetty](http://eclipse.org/jetty).
