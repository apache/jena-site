---
title: Apache Jena Fuseki
slug: index
aliases:
    - /documentation/serving_data
    - /documentation/serving_data/index.html
---

Apache Jena Fuseki is a SPARQL server.  It can run as a standalone server, or embedded in an
application.

Fuseki provides the
SPARQL 1.1 [protocols for query and update](http://www.w3.org/TR/sparql11-protocol/)
as well as the
[SPARQL Graph Store protocol](http://www.w3.org/TR/sparql11-http-rdf-update/).

Fuseki is integrated with [TDB](../tdb/index.html) to provide a robust,
transactional, persistent storage layer. Fuseki also incorporates
[Jena text query](../query/text-query.html).

## Contents

- [Download](#download-fuseki)
- [Getting Started](fuseki-quick-start.html)
- [Running Fuseki Server](fuseki-server.html)
    - [As a standalone server](fuseki-server.html#fuseki-standalone-server)
    - [As a service](fuseki-server.html#fuseki-service)
    - [As a web application](fuseki-server.html#fuseki-web-application)
    - [Security](fuseki-security.html) with [Apache Shiro](https://shiro.apache.org/)
- [Running Fuseki Plain](fuseki-plain.html)
    - [Setup](fuseki-plain.html#setup)
    - [As a Docker container](fuseki-plain#fuseki-docker)
    - [As an embedded SPARQL server](fuseki-embedded.html)
    - [Security and data access control](fuseki-data-access-control.html)
    - [Logging](fuseki-logging.html)
- [Fuseki Configuration](fuseki-configuration.html)
- [Server Statistics and Metrics](fuseki-server-info.html)
- [How to Contribute](#how-to-contribute)
- Client access
    - [Use from Java](../rdfconnection)
- Extending Fuseki with [Fuseki Modules](fuseki-modules.html)
- [Links to Standards](rdf-sparql-standards.html)

The Jena users mailing is the place to get help with Fuseki.

[Email support lists](/help_and_support/#email-support-lists)

## Download Fuseki

Releases of Apache Jena Fuseki can be downloaded from:

[Jena Downloads](/download)

**Fuseki download files**

| Filename | Description |
|---------|-------------|
|`apache-jena-fuseki-*VER*.zip` | The Fuseki server and UI |

The Fuseki engine is also available as a Maven artifact:

    <dependency>
       <groupId>org.apache.jena</groupId>
       <artifactId>jena-fuseki-main</artifactId>
       <version>X.Y.Z</version>
    </dependency>

and the UI is available as:

    <dependency>
       <groupId>org.apache.jena</groupId>
       <artifactId>jena-fuseki-ui</artifactId>
       <version>X.Y.Z</version>
    </dependency>


A WAR file is also available from the Jena [download](/download) page.

### Previous releases

While previous releases are available, we strongly recommend that wherever
possible users use the latest official Apache releases of Jena in
preference to using any older versions of Jena.

Previous Apache Jena releases can be found in the Apache archive area
at [https://archive.apache.org/dist/jena](http://archive.apache.org/dist/jena/)

### Development Builds

Regular development builds of all of Jena are available 
(these are not formal releases) from the
[Apache snapshots maven repository](https://repository.apache.org/snapshots/org/apache/jena).
This includes the packaged build of Fuseki.

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
| jena-fuseki-main    | The Fuseki server |
| jena-fuseki-core    | The Fuseki engine |
| jena-fuseki-ui      | The Fuseki UI |
| jena-fuseki-server  | Build the combined jar for Fuseki server |
| jena-fuseki-access  | [Data access control](fuseki-data-access-control.html) |
| apache-jena-fuseki  | The download for Fuseki |
| <b>Other</b>        | |
| jena-fuseki-docker  | Build a docker container for Fuseki |
| jena-fuseki-geosparql | Integration for GeoSPARQL |
| jena-fuseki-mod-geosparql | Integration for GeoSPARQL |
| <b>Webapp</b>       | |
| jena-fuseki-webapp  | Web application and command line startup |
| jena-fuseki-war     | Build the war file for Fuseki/UI server |
