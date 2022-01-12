---
title: Apache Jena Fuseki
slug: index
aliases:
    - /documentation/serving_data
    - /documentation/serving_data/index.html
---

Apache Jena Fuseki is a SPARQL server.  It can run as a operating system
service, as a Java web application (WAR file), and as a standalone server.

Fuseki comes in in two forms, a single system "webapp", combined with a UI
for admin and query, and as "main", a server suitable to run as part of a larger
deployment, including [with Docker](fuseki-main.html#docker) or running embedded.
Both forms use the same core protocol engine and [same configuration file
format](fuseki-configuration.html).

Fuseki provides the
SPARQL 1.1 [protocols for query and update](http://www.w3.org/TR/sparql11-protocol/)
as well as the
[SPARQL Graph Store protocol](http://www.w3.org/TR/sparql11-http-rdf-update/).

Fuseki is tightly integrated with [TDB](../tdb/index.html) to provide a robust,
transactional persistent storage layer, and incorporates
[Jena text query](../query/text-query.html).

## Contents

- [Download with UI](#download-fuseki)
- [Getting Started](#getting-started-with-fuseki)
- [Running Fuseki with UI](fuseki-webapp.html)
    - [As a standalone server with UI](fuseki-webapp.html#fuseki-standalone-server)
    - [As a service](fuseki-webapp.html#fuseki-service)
    - [As a web application](fuseki-webapp.html#fuseki-web-application)
    - [Security](fuseki-security.html) with [Apache Shiro](https://shiro.apache.org/)
- [Running Fuseki Server](fuseki-main.html)
    - [Setup](fuseki-main.html#setup)
    - [As a Docker container](fuseki-main#fuseki-docker)
    - [As an embedded SPARQL server](fuseki-embedded.html)
    - [Security and data access control](fuseki-data-access-control.html)
    - [Logging](fuseki-logging.html)
- [Fuseki Configuration](fuseki-configuration.html)
- [Server Statistics and Metrics](fuseki-server-info.html)
- [How to Contribute](#how-to-contribute)
- Client access
    - [Use from Java](../rdfconnection)
    - [SPARQL Over HTTP](soh.html) - scripts to help with data management.
- Extending Fuseki with [Fuseki Modules](fuseki-modules.html)
- [Links to Standards](rdf-sparql-standards.html)

The Jena users mailing is the place to get help with Fuseki.

[Email support lists](/help_and_support/#email-support-lists)

## Download Fuseki with UI

Releases of Apache Jena Fuseki can be downloaded from one of the mirror sites:

[Jena Downloads](/download)

and previous releases are available from [the archive](https://archive.apache.org/dist/jena/).
We strongly recommend that users use the latest official Apache releases of Jena Fuseki in
preference to any older versions.

**Fuseki download files**

| Filename | Description |
|---------|-------------|
|`apache-jena-fuseki-*VER*.zip` | Fuseki with UI download |
|[`jena-fuseki-server`](https://repo1.maven.org/maven2/org/apache/jena/jena-fuseki-server) | The Fuseki Main packaging |

`apache-jena-fuseki-*VER*.zip` contains both a war file and an executable jar.

Fuskei Main is also available as a Maven artifact:

    <dependency>
       <groupId>org.apache.jena</groupId>
       <artifactId>jena-fuseki-main</artifactId>
       <version>X.Y.Z</version>
    </dependency>

### Previous releases

While previous releases are available, we strongly recommend that wherever
possible users use the latest official Apache releases of Jena in
preference to using any older versions of Jena.

Previous Apache Jena releases can be found in the Apache archive area
at [https://archive.apache.org/dist/jena](http://archive.apache.org/dist/jena/)

### Development Builds

Regular development builds of all of Jena are available (these are not
formal releases) from the
[Apache snapshots maven repository](https://repository.apache.org/snapshots/org/apache/jena).
This includes packaged builds of Fuseki.

## Getting Started With Fuseki

The [quick start](fuseki-quick-start.html) section serves as a basic
guide to getting a Fuseki server running on your local machine.  

See [all the ways to run Fuseki](fuseki-webapp.html) for complete coverage of all the
deployment methods for Fuseki.

## How to Contribute

We welcome contributions towards making Jena a better platform for semantic
web and linked data applications.  We appreciate feature suggestions, bug
reports and patches for code or documentation.

See "[Getting Involved](/getting_involved/index.html)" for ways to
contribute to Jena and Fuseki, including patches and making github
pull-requests.

### Source code

The development codebase is available from git.

Development builds (not a formal release):
[SNAPSHOT](https://repository.apache.org/content/repositories/snapshots/org/apache/jena/jena-fuseki/)

Source code:
[https://github.com/apache/jena/tree/main/jena-fuseki2](https://github.com/apache/jena/tree/main/jena-fuseki2)

The Fuseki code is under "jena-fuseki2/":

| Code | Purpose |
|---------------|--|
| jena-fuseki-core | The Fuseki engine. All SPARQL operations.
| <b>Fuseki/Main</b> | |
| jena-fuseki-main   | Embedded server and command line 
| jena-fuseki-server | Build the combined jar for Fusek/main server |
| jena-fuseki-docker | Build a docker conntained based on Fusek/main |
| <b>Webapp </b>     | |
| jena-fuseki-webapp | Web application and command line startup |
| jena-fuseki-fulljar | Build the combined jar for Fuseki/UI server |
| jena-fuseki-war     | Build the war file for  Fusek/UI server |
| apache-jena-fuseki  | The download for Fuskei |
| <b>Other</b>        | |
| jena-fuseki-access    | [Data access control](fuseki-data-access-control.html) |
| jena-fuseki-geosparql | Integration for GeoSPARQL |
