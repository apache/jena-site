---
title: Running Fuseki with UI
---

Fuseki/UI can be run in a number of ways:

* [As a standalone server](#fuseki-standalone-server)
* [As a service](#fuseki-service) run by the operation system, for example, started when the machine
* [As a Web Application](#fuseki-web-application) inside a container such as Apache Tomcat or Jetty
boots.

Fuseki is also packaged as a plain server ["Fuseki Main"](fuseki-main.html)
with no UI for use as a configurable SPARQL server, for [building as a Docker
container](fuseki-docker.html), and as a deployment and development standalone
server.

Both packaging used the same configuration file format, and in standalone server
mode, the same command line arguments.

See "[Fuseki Configuration](fuseki-configuration.html)" for information on
how to provide datasets and configure services using the configuration file.

## Fuseki as a Standalone Server {#fuseki-standalone-server}

This is running Fuseki from the command line.

To publish at <tt>http://<i>host</i>:3030/NAME</i></tt>:

where `/NAME` is the dataset publishing name at this server in URI space.

TDB1 database:

    fuseki-server [--loc=DIR] [[--update] /NAME]

The argument `--tdb2` puts the command line handling into "TDB2 mode".
A dataset created with `--loc` is a TDB2 dataset.
TDB2 database:

    fuseki-server --tdb2 [--loc=DIR] [[--update] /NAME]

In-memory, non-peristent database (always updatable):

    fuseki-server --mem /NAME

Load a file at start and provide it read-only:

    fuseki-server --file=MyData.ttl /NAME

where "MyData.ttl" can be any RDF format, both triples or quads. 

Administrative functions are only available from "localhost".

See `fuseki-server --help` for details of more arguments.

## Layout

When run from the command line, the server creates its work area in the
directory named by environment variable `FUSEKI_BASE`. When run from the
command line, this defaults to the current directory.

[Fuseki layout](fuseki-layout.html)

If you get the error message `Can't find jarfile to run` then you either
need to put a copy of `fuseki-server.jar` in the current directory or set
the environment variable `FUSEKI_HOME` to point to an unpacked Fuseki
distribution.

Starting with no dataset and no configuration is possible.
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

When deploying as a web application a more fully featured Admin API is
made available and described on the 
[Fuseki Server Protocol (REST API)](fuseki-server-protocol.html) page.

## Configuring logging

When running from a WAR file in a webapp container such as Apache Tomcat, the
logging configuration comes from the file `log4j2.properties` in the root of the
unpacked war file, e.g. `/var/lib/tomcat9/webapps/fuseki/log4j2.properties`.

The name of the file is taken from `web.xml`:

  <context-param>
    <param-name>log4jConfiguration</param-name>
    <param-value>log4j2.properties</param-value>
  </context-param>

This only applies when running in a webapp container. When run from the command
line, the server looks for `log4j2.properties` in the current directory and if
not found, uses a built-in configuration.

This logging goes to the standard output.

## Fuseki with Tomcat9 and systemd

`systemd` may be set to sandbox Tomcat9. The file area `/etc/fuseki` will not
be writable to Fuseki. To enable this area, add `ReadWritePaths=/etc/fuseki/` to
the file `/etc/systemd/system/tomcat9.service.d/override.conf`,
creating the file if necessary.

`systemd` also captures standard out and routes it to the system journal:

```
  journalctl -u tomcat9
```

To direct the output to the traditional location of
/var/log/tomcat9/catalina.out use the `StandardOutput` setting in `override.conf`:

```
    [Service]
   
    # Allow access to the Fuseki area
    ReadWritePaths=/etc/fuseki/
    StandardOutput=file:/var/log/tomcat9/catalina.out
```
