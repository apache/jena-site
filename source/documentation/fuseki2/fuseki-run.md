---
title: Running Fuseki
---

Fuseki can be run in a number of ways:

* [As a standalone server](#fuseki-standalone-server)
* [As a service](#fuseki-service) run by the operation system, for example, started when the machine
* [As a Web Application](#fuseki-web-application) inside a container such as Apache Tomcat or Jetty
boots.
* [As a configurable SPARQL server](#fuseki-main)
* [As a deployment and development standalone server](#fuseki-server)

See "[Fuseki Configuration](fuseki-configuration.html)" for information on
how to provide datasets and configure services.

## Fuseki as a Standalone Server {#fuseki-standalone-server}

This is running Fuseki from the command line.

    fuseki-server [--mem | --loc=DIR] [[--update] /NAME]

    fuseki-server --config=CONFIG

where `/NAME` is the dataset publishing name at this server in URI space.

The argument `--tdb2` puts the command line handling into "TDB2 mode".
A dataset created with `--loc` is a TDB2 dataset.

See `fuseki-server --help` for details of more arguments.

`FUSEKI_BASE`, the runtime area for the server instance, defaults to the
`run/` directory of the current directory.

Fuseki v2 supports the same style of configuration file as Fuseki v1 but it
is better to separate the data service definitions from the server
configuration with one definition per file in `FUSEKI_BASE/configuration`;
see "[Fuseki Configuration](fuseki-configuration.html)".

If you get the error message `Can't find jarfile to run` then you either
need to put a copy of `fuseki-server.jar` in the current directory or set
the environment variable `FUSEKI_HOME` to point to an unpacked Fuseki
distribution.

Unlike Fuseki v1, starting with no dataset and no configuration is possible.
Datasets can be added from the admin UI to a running server.

## Fuseki as a Service {#fuseki-service}

Fuseki can run as an operating system service, started when the server
machine boots.  The script `fuseki` is a Linux `init.d` with the common
secondary arguments of `start` and `stop`.

Process arguments are read from `/etc/default/fuseki` including
`FUSEKI_HOME` and `FUSEKI_BASE`.  `FUSEKI_HOME` should be the directory
where the distribution was unpacked.

## Fuseki as a Web Application {#fuseki-web-application}

Fuseki can run from a
[WAR](http://en.wikipedia.org/wiki/WAR_%28file_format%29) file.  Fuseki
requires at least support for the Servlet 3.0 API (e.g. Apache Tomcat 7 or
Jetty 8) as well as Java8.

`FUSEKI_HOME` is not applicable.

`FUSEKI_BASE` defaults to `/etc/fuseki` which must be a writeable
directory.  It is initialised the first time Fuseki runs, including a
[Apache Shiro](http://shiro.apache.org/) security file but this is only
intended as a starting point.  It restricts use of the admin UI to the
local machine.

## Fuseki as Configurable and Embeddable SPARQL Server {#fuseki-main}

Fuseki can be run from inside an Java application to provide SPARQL
services to application data. The application can continue to access and
update the datasets served by the server.

Basic example:

    Dataset ds = ...
    FusekiServer server = FusekiServer.create()
      .add("/dataset", ds)
      .build() ;
    server.start() ;

See the [full documentation](fuseki-main.html) for details of
configuration and working with data shared with the
[Fuseki main server](fuseki-main.html) instance.

## Fuseki-Server (no UI) {#fuseki-server}

The artifact `org.apache.jena:jena-fuseki-server` is a packaging of
the [Fuseki "main" server](fuseki-main.html) server that runs from 
the command line.  Unlike the full Fuseki server, it is only configured
from the command line and has no persistent work area on-disk. 
It has full SPARQL and all storage options.
