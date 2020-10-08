---
title: "Fuseki : Main Server"
---

Fuseki main is a packaging of Fuseki as a triple store without a UI for administration.

Fuseki can be run in the background by an application as an embedded server.  The
application can safely work with the dataset directly from java while having Fuseki
provide SPARQL access over HTTP.  An embedded server is useful for
adding functionality around a triple store and also for development and testing.

* [Running as a deployment or development server](#fuseki-server)
* [Running from Docker](#fuseki-docker)
* [Running as an embedded server](fuseki-embedded.html)
    * [Dependencies and Setup](fuseki-embedded.html#dependencies)
    * [Logging](fuseki-embedded.html#logging)
    * [Building a Server](fuseki-embedded.html#build)
    * [Examples](fuseki-embedded.html#examples)

The main server does not depend on any files on disk (other than for
databases provided by the application), and does not provide the Fuseki
UI or admins functions to create dataset via HTTP.

See also [Data Access Control for Fuseki](./fuseki-data-access-control.html).

## Running as a configured deployment or development server {#fuseki-server}

The artifact `org.apache.jena:jena-fuseki-server` is a packaging of
the "main" server that runs from the command line.  Unlike the UI 
Fuseki server, it is only configured from the command line and has no
persistent work area on-disk.

    java -jar jena-fuseki-server-$VER.jar --help

The arguments are the same as the 
[full UI server command line program](/documentation/fuseki2/fuseki-webapp.html#fuseki-standalone-server).
There are no special environment variables.

The entry point is `org.apache.jena.fuseki.main.cmds.FusekiMainCmd` so
the server can also be run as:

    java -cp jena-fuseki-server-$VER.jar:...OtherJars... \
        org.apache.jena.fuseki.main.cmds.FusekiMainCmd ARGS

## Docker {#fuseki-docker}

A kit to build a container with docker or docker compose 

    https://repo1.maven.org/maven2/org/apache/jena/jena-fuseki-docker/

Note: take care that databases are on mounted volumes if they are to persist
after the container is removed.

See the [Fuseki docker tools page](fuseki-docker.html) for details.

## Running as an embedded server

Fuseki can be run from inside an Java application to provide SPARQL
services to application data. The application can continue to access and
update the datasets served by the server.

To build and start the server:

    Dataset ds = ...
    FusekiServer server = FusekiServer.create()
      .add("/dataset", ds)
      .build() ;
    server.start() ;

See [Fuseki embedded documentation](fuseki-embedded.html) for details and examples.
