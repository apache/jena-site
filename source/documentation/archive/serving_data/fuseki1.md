---
title: "Fuseki: serving RDF data over HTTP"
---

## See the [Fuseki2 documentation](/documentation/fuseki2/).

----
> This page covers Fuseki v1.<br/>
> Fuseki1 is deprecated and has been retired.<br/>
> The last release of Jena with this module is Jena 3.9.0.<br/>
----

Fuseki is a SPARQL server. It provides REST-style SPARQL HTTP Update, SPARQL Query,
and SPARQL Update using the SPARQL protocol over HTTP.

The relevant SPARQL standards are:

-   [SPARQL 1.1 Query](http://www.w3.org/TR/sparql11-query/)
-   [SPARQL 1.1 Update](http://www.w3.org/TR/sparql11-update/)
-   [SPARQL 1.1 Protocol](http://www.w3.org/TR/sparql11-protocol/)
-   [SPARQL 1.1 Graph Store HTTP Protocol](http://www.w3.org/TR/sparql11-http-rdf-update/)

## Contents

-   [Download](#download-fuseki1)
-   [Getting Started](#getting-started-with-fuseki)
-   [Security](#security-and-access-control)
-   [Logging](#logging)
-   [Server URI scheme](#server-uri-scheme)
-   [Running a Fuseki Server](#running-a-fuseki-server)
-   [Fuseki Configuration File](#fuseki-configuration-file)
-   [SPARQL Over HTTP](#sparql-over-http)
-   [Use from Java](#use-from-java)
-   [Development System](#development-system)

## Download Fuseki1

Binaries for Fuseki1 are available from the 
[maven
repositories](http://central.maven.org/maven2/org/apache/jena/jena-fuseki1/).

The source code is available in the Apache Jena source release.

## Getting Started With Fuseki

This section provides a brief guide to getting up and running with
a simple server installation. It uses the
[SOH (SPARQL over HTTP)](/documentation/fuseki2/soh.html) scripts included in the
download.

1.  [Download](/download/#jena-fuseki) the latest `jena-fuseki-*-distribution` 
2.  Unpack the downloaded file with `unzip` or `tar zxfv`
3.  (Linux) `chmod +x fuseki-server s-*`
4.  Run a server

     ./fuseki-server --update --mem /ds

The server logging goes to the console:

    09:25:41 INFO  Fuseki               :: Dataset: in-memory
    09:25:41 INFO  Fuseki               :: Update enabled
    09:25:41 INFO  Fuseki               :: Fuseki development
    09:25:41 INFO  Fuseki               :: Jetty 7.2.1.v20101111
    09:25:41 INFO  Fuseki               :: Dataset = /ds
    09:25:41 INFO  Fuseki               :: Started 2011/01/06 09:25:41 GMT on port 3030

## User Interface

The Fuseki download includes a number of services:

-   SPARQL Query, SPARQL Update, and file upload to a selected
    dataset.
-   Link to the documentation (here).
-   Validators for SPARQL query and update and for non-RDF/XML
    formats.

For the control panel:

1.  In a browser, go to `http://localhost:3030/`
2.  Click on *Control Panel*
3.  Select the dataset (if set up above, there is only one choice).

The page offers SPARQL operations and file upload acting on the
selected dataset.

## Script Control

In a new window:

Load some RDF data into the default graph of the server:

    s-put http://localhost:3030/ds/data default books.ttl

Get it back:

    s-get http://localhost:3030/ds/data default

Query it with SPARQL using the .../query endpoint.

    s-query --service http://localhost:3030/ds/query 'SELECT * {?s ?p ?o}'

Update it with SPARQL using the .../update endpoint.

    s-update --service http://localhost:3030/ds/update 'CLEAR DEFAULT'

## Security and Access Control

Fuseki does not currently offer security and access control itself.

Authentication and control of the number of concurrent requests can
be added using an Apache server and either blocking the Fuseki port
to outside traffic (e.g. on Amazon's EC2) or by listening only the
`localhost` network interface. This is especially important for update
endpoints (SPARQL Update, SPARQL Graph Store protocol with
PUT/POST/DELETE enabled).

Data can be updated without access control if the server is started
with the `--update` argument. If started without that argument, data
is read-only.

## Logging

Fuseki uses
[Log4J](http://logging.apache.org/log4j/)
for logging. There are two main logging channels:

1.  The general server messages: `org.apache.jena.fuseki.Server`
2.  A channel for all request messages: `org.apache.jena.fuseki.Fuseki`

The default settings are (this is an extract of a log4j properties
file):

    # Fuseki
    # Server log.
    log4j.logger.org.apache.jena.fuseki.Server=INFO
    # Request log.
    log4j.logger.org.apache.jena.fuseki.Fuseki=INFO
    # Internal logs
    log4j.logger.org.apache.jena.fuseki=INFO

## Server URI scheme

This details the service URIs for Fuseki:

-   `http://*host*/`*dataset*`/query` -- the SPARQL query endpoint.
-   `http://*host*/`*dataset*`/update` -- the SPARQL Update language
    endpoint.
-   `http://*host*/`*dataset*`/data` -- the SPARQL Graph Store Protocol
    endpoint.
-   `http://*host*/`*dataset*`/upload` -- the file upload endpoint.

Where *dataset* is a URI path. Note that Fuseki defaults to using
port 3030 so *host* is often *localhost:3030*.

**Important** - While you may set *dataset* to be the text `dataset` this should be avoided since it may interfere with the function of the control panel and web pages.

The URI
`http://host/`*dataset*`/sparql`
is currently mapped to `/query` but this may change to being a
general purpose SPARQL query endpoint.

## Running a Fuseki Server

The server can be run with the script `fuseki-server`. Common forms
are:

    fuseki-server --mem  /DatasetPathName

    fuseki-server --file=FILE /DatasetPathName

    fuseki-server --loc=DB /DatasetPathName

    fuseki-server --config=ConfigFile

There is an option `--port=PORT` to set the port number. It
defaults to 3030.

`/DatasetPathName` is the name under which the dataset will be
accessible over HTTP.  Please see the above section on Server URI scheme for notes regarding available URIs and choice of this name

The server will service read requests only unless the `--update`
argument is used.

The full choice of dataset forms is:

**Fuseki Dataset Descriptions**

-   `--mem` <br /> Create an empty, in-memory (non-persistent) dataset.
-   `--file=FILE` <br />
    Create an empty, in-memory (non-persistent) dataset, then load FILE
    into it.
-   `--loc=DIR` <br />Use an existing TDB database. Create an empty one if it does not
    exist.
-   `--desc=assemblerFile` <br /> Construct a dataset based on the general assembler description.
-   `--config=ConfigFile` <br /> Construct one or more service endpoints based on the
    [configuration description](#fuseki-configuration-file).

A copy of TDB is included in the standalone server. An example
assembler file for TDB is in tdb.ttl.

**Fuseki Server Arguments**

-   `--help`          <br /> Print help message.
-   `--port=*number*` <br /> Run on port *number* (default is 3030).
-   `--localhost`     <br /> Listen only to the localhost network interface.
-   `--update`        <br /> Allow update. Otherwise only read requests are served (ignored if a configuration file is given).

## Fuseki Server starting with an empty dataset

    fuseki-server --update --mem /ds

runs the server on port 3030 with an in-memory dataset. It can be
accessed via the appropriate protocol at the following URLs:

-   SPARQL query: `http://localhost:3030/ds/query`
-   SPARQL update: `http://localhost:3030/ds/update`
-   SPARQL HTTP update: `http://localhost:3030/ds/data`

The [SPARQL Over HTTP](/documentation/fuseki2/soh.html) scripts take care of naming
and protocol details. For example, to load in a file `data.rdf`:

     s-put http://localhost:3030/ds/data default data.rdf

## Fuseki Server and TDB

Fuseki includes a built-in version of TDB. Run the server with the
`--desc` argument

    fuseki-server --desc tdb.ttl /ds

and a database in the directory DB, an assembler description of:

    @prefix rdf:     <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
    @prefix rdfs:    <http://www.w3.org/2000/01/rdf-schema#> .
    @prefix ja:      <http://jena.hpl.hp.com/2005/11/Assembler#> .
    @prefix tdb:     <http://jena.hpl.hp.com/2008/tdb#> .

    <#dataset> rdf:type      tdb:DatasetTDB ;
         tdb:location "DB" ;
         .

The form:

    fuseki-server --loc=DB /ds

is a shorthand for such an assembler with location `DB`.

To make triples from all the named graphs appear as the default,
unnamed graph, use:

    <#dataset> rdf:type      tdb:DatasetTDB ;
         tdb:location "DB" ;
         tdb:unionDefaultGraph true ;
        .

## Fuseki Server and general dataset descriptions

The Fuseki server can be given an
[assembler description](/documentation/assembler/)
to build a variety of model and datasets types.

    fuseki-server --desc assembler.ttl /ds

Full details of setting up models assembler is given in the
[assembler documentation](/documentation/assembler/) and [assembler howto](/documentation/assembler/assembler-howto.html).

A general dataset is described by:

    # Dataset of default graph and one named graph.
    <#dataset> rdf:type ja:RDFDataset ;
       ja:defaultGraph <#modelDft> ;
       ja:namedGraph
           [ ja:graphName      <http://example.org/name1> ;
             ja:graph          <#model1> ] ;
       .

    <#modelDft> a ja:MemoryModel ;
            ja:content [ ja:externalContent <file:Data.ttl> .

    <#model1>  rdf:type ja:MemoryModel ;
       ja:content [ ja:externalContent <file:FILE-1.ttl> ] ;
       ja:content [ ja:externalContent <file:FILE-2.ttl> ] ;
       .

The models can be
[Jena inference models](/documentation/inference/).

## Fuseki Configuration File

A Fuseki server can be set up using a configuration file. The
command-line arguments for publishing a single dataset are a short
cut that, internally, builds a default configuration based on the
dataset name given.

The configuration is an RDF graph. One graph consists of one server
description, with a number of services, and each service offers a
number of endpoints over a dataset.

The example below is all one file (RDF graph in Turtle syntax)
split to allow for commentary.

### Prefix declarations

Some useful prefix declarations:

    @prefix fuseki:  <http://jena.apache.org/fuseki#> .
    @prefix rdf:     <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
    @prefix rdfs:    <http://www.w3.org/2000/01/rdf-schema#> .
    @prefix tdb:     <http://jena.hpl.hp.com/2008/tdb#> .
    @prefix ja:      <http://jena.hpl.hp.com/2005/11/Assembler#> .
    @prefix :        <#> .

### Server Section

Order of the file does not matter to the machine, but it's useful
to start with the server description, then each of the services
with its datasets.

    [] rdf:type fuseki:Server ;
       # Server-wide context parameters can be given here.
       # For example, to set query timeouts: on a server-wide basis:
       # Format 1: "1000" -- 1 second timeout
       # Format 2: "10000,60000" -- 10s timeout to first result, then 60s timeout to for rest of query.
       # See java doc for ARQ.queryTimeout
       # ja:context [ ja:cxtName "arq:queryTimeout" ;  ja:cxtValue "10000" ] ;

       # Services available.  Only explicitly listed services are configured.
       #  If there is a service description not linked from this list, it is ignored.
       fuseki:services (
         <#service1>
         <#service2>
       ) .

### Assembler Initialization

All datasets are described by
[assembler descriptions](../assembler/index.html).
Assemblers provide an extensible way of describing many kinds of
objects. Set up any assembler extensions - here, the TDB assembler
support.

### Service 1

This service offers SPARQL Query, SPARQL Update and SPARQL Graph
Store protocol, as well as file upload, on an in-memory dataset.
Initially, the dataset is empty.

    ## ---------------------------------------------------------------
    ## Updatable in-memory dataset.

    <#service1> rdf:type fuseki:Service ;
        fuseki:name                       "ds" ;       # http://host:port/ds
        fuseki:serviceQuery               "query" ;    # SPARQL query service
        fuseki:serviceQuery               "sparql" ;   # SPARQL query service
        fuseki:serviceUpdate              "update" ;   # SPARQL query service
        fuseki:serviceUpload              "upload" ;   # Non-SPARQL upload service
        fuseki:serviceReadWriteGraphStore "data" ;     # SPARQL Graph store protocol (read and write)
        # A separate read-only graph store endpoint:
        fuseki:serviceReadGraphStore      "get" ;      # SPARQL Graph store protocol (read only)
        fuseki:dataset                   <#dataset-mem> ;
        .

    <#dataset-mem> rdf:type ja:RDFDataset .

### Service 2

This service offers a number of endpoints. It is read-only, because
only read-only endpoints are defined (SPARQL Query and HTTP GET
SPARQl Graph Store protocol). The dataset is a single in-memory
graph:

This service offers read-only access to a dataset with a single
graph of data.

    <#service2> rdf:type fuseki:Service ;
        fuseki:name                     "books" ;    # http://host:port/books
        fuseki:serviceQuery             "query" ;    # SPARQL query service
        fuseki:serviceReadGraphStore    "data" ;     # SPARQL Graph store protocol (read only)
        fuseki:dataset           <#books> ;
        .

    <#books>    rdf:type ja:RDFDataset ;
        rdfs:label "Books" ;
        ja:defaultGraph
          [ rdfs:label "books.ttl" ;
            a ja:MemoryModel ;
            ja:content [ja:externalContent <file:Data/books.ttl> ] ;
          ] ;
        .

### Service 3

This service offers SPARQL query access only to a TDB database. The
TDB database can have specific features set, such as query timeout
or making the default graph the union of all named graphs.

    <#service3>  rdf:type fuseki:Service ;
        fuseki:name              "tdb" ;       # http://host:port/tdb
        fuseki:serviceQuery      "sparql" ;    # SPARQL query service
        fuseki:dataset           <#dataset> ;
        .

    <#dataset> rdf:type      tdb:DatasetTDB ;
        tdb:location "DB" ;
        # Query timeout on this dataset (1s, 1000 milliseconds)
        ja:context [ ja:cxtName "arq:queryTimeout" ;  ja:cxtValue "1000" ] ;
        # Make the default graph be the union of all named graphs.
        ## tdb:unionDefaultGraph true ;
         .

## SPARQL Over HTTP

**SOH** (SPARQL Over HTTP) is a set of command-line scripts for
working with SPARQL 1.1. SOH is server-independent and will work
with any compliant SPARQL 1.1 system offering HTTP access.

See the [SPARQL Over HTTP](/documentation/fuseki2/soh.html) page.

### Examples

    # PUT a file
    s-put http://localhost:3030/ds/data default D.nt

    # GET a file
    s-get http://localhost:3030/ds/data default

    # PUT a file to a named graph
    s-put http://localhost:3030/ds/data http://example/graph D.nt

    # Query
    s-query --service http://localhost:3030/ds/query 'SELECT * {?s ?p ?o}'

    # Update
    s-update --service http://localhost:3030/ds/update --file=update.ru

## Use from Java

### SPARQL Query

ARQ's `QueryExecutionFactory.sparqlService` can be used.

### SPARQL Update

See `UpdateExecutionFactory.createRemote`

### SPARQL HTTP

See `DatasetAccessor`
