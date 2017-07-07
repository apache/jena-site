Title: Fuseki : Embedded Server

Fuseki can be run in the background by an application as an embedded server.  The
application can safely work with the dataset directly from java while having Fuseki
provide SPARQL access over HTTP.  An embedded server is also useful for development
and testing.

* [Application Use](#usage)
* [Dependencies and Setup](#dependencies)
* [Logging](#logging)
* [Building a Server](#build)
* [Running as a standalone server](#fuseki-basic)

The embedded server does not depend on any files on disk (other than for
databases provided by the application), and does not provide
the Fuseki UI or admins functions to create dataset via HTTP.

## Application Use {#usage}

The application can safely access and modify the data published by the server if it does
so inside a [transaction](/documentation/txn/) using an appropriate
storage choice. `DatasetFactory.createTxnMem()` is a good choice for in-memory use;
[TDB](/documentation/tdb/) is a good choice for a persistent database.

To build and start the server:

    Dataset ds = ...
    FusekiServer server = FusekiServer.create()
      .add("/rdf", ds)
      .build() ;
    server.start() ;

then the application can modify the dataset:

    // Add some data while live.
    // Write trasnaction.
    Txn.execWrite(dsg, ()->RDFDataMgr.read(dsg, "D.trig")) ;

or read the dataset and see any updates made by remote systems:

    // Query data while live
    // Read transaction.
    Txn.execRead(dsg, ()->{
    Dataset ds = DatasetFactory.wrap(dsg) ;
    try (QueryExecution qExec = QueryExecutionFactory.create("SELECT * { ?s  ?o}", ds) ) {
        ResultSet rs = qExec.execSelect() ;
        ResultSetFormatter.out(rs) ;
      }
    }) ;

The full Jena API can be used provided operations (read and write) are inside
a transaction.

## Dependencies and Setup {#dependencies}

To include an embedded Fuseki server in the application:

    <dependency>
      <groupId>org.apache.jena</groupId>
      <artifactId>jena-fuseki-embedded</artifactId>
      <version>2.x.y</version> <!-- Set the version -->
    </dependency>

This brings in enough dependencies to run Fuseki. Applicartion writers are strongly
encouraged to use a dependency manager because the numbe rof Jetty and other dependencies
is quite large and difficult to set manually.

This dependency does not include a logging setting. Fusek uses [slf4j](http://slf4j.org/).
See section "[Logging](#logging)" for details.

If the application wishes to use a dataset with a [text-index](http://jena.apache.org/documentation/query/text-query.html)
then the application wil also need to include jena-text in its dependencies.

## Logging {#logging}

The application must set the logging provided for [slf4j](http://slf4j.org/).
Apache jena provides helpers for the JDK-provided java logging and for Apache Log4j v1.

Using the JDK-provided java logging:

    LogCtl.setJavaLogging()

and a dependency of:

    <dependency>
      <groupId>org.slf4j</groupId>
      <artifactId>slf4j-jdk14</artifactId>
      <version>1.x.y</version>
    </dependency>

For Apache log4j: - this is how the full Fuseki server sets its logging:

    FusekiLogging.setLogging();

and dependencies:

    <dependency>
      <groupId>org.slf4j</groupId>
      <artifactId>slf4j-log4j12</artifactId>
      <version>1.x.y</version>
    </dependency>

    <dependency>
      <groupId>log4j</groupId>
      <artifactId>log4j</artifactId>
      <version>1.x.y</version>
    </dependency>

See [Fuseki Logging](http://jena.apache.org/documentation/fuseki2/fuseki-logging.html).

To silence logging from Java, try:

    LogCtl.setLevel(Fuseki.serverLogName,  "WARN");
    LogCtl.setLevel(Fuseki.actionLogName,  "WARN");
    LogCtl.setLevel(Fuseki.requestLogName, "WARN");
    LogCtl.setLevel(Fuseki.adminLogName,   "WARN");
    LogCtl.setLevel("org.eclipse.jetty",   "WARN");

## Building a server {#build}

A ``FusekiServer`` is built by creating a configuration,
building the server, then running it.  The application needs to start
the server.

The default port for a Fuseki embedded server is 3330. This is different for the default
port for Fuseki running as a standalone server or as a webapp application.

## Running as a standalone server {#fuseki-basic}

The artifact `org.apache.jena:jena-fuseki-basic` is a packaging of
the embedded server that runs from the command line.  Unlike the full
Fuseki server, it is only configured from the command line and has no
persistent work area on-disk.

### Example 1
Create a server on port 3330, that provides the default set of endpoints for an RDF
dataset that can be updated via HTTP.

    DatasetGraph ds = DatasetFactory.createTxnMem() ;
    FusekiServer server = FusekiServer.create()
        .add("/ds", ds)
        .build() ;
    server.start() ;
    ...
    server.stop() ;

URLs:

| Service | Endpoint |
|---------|----------|
| SPARQL Query      | ``http://host:3330/ds/query``   |
| SPARQL Query      | ``http://host:3330/ds/sparql``  |
| SPARQL Update     | ``http://host:3330/ds/update``  |
| File upload       | ``http://host:3330/ds/update``  |
| GSP read-write    | ``http://host:3330/ds/data``    |
| Read-write quads  | ``http://host:3330/ds``         |

"GSP" = SPARQL Graph Store Protocol

### Example 2
Create a server on port 3332, that provides the default set of endpoints for a data
set that is read-only over HTTP. The application can still update the dataset.

    Dataset ds = ... ;
    FusekiServer server = FusekiServer.create()
        .setPort(3332)
        .add("/ds", ds, true)
        .build() ;
    server.start() ;

| Service | Endpoint |
|---------|----------|
| SPARQL Query   | ``http://host:3332/ds/query``   |
| SPARQL Query   | ``http://host:3332/ds/sparql``  |
| GSP read-only  | ``http://host:3332/ds/data``    |
| GET quads      | ``http://host:3332/ds``         |

### Example 3

Different combinations of services and endpoint names can be given using a `DataService`.

    DatasetGraph dsg = ... ;
    DataService dataService = new DataService(dsg) ;
    dataService.addEndpoint(OperationName.Quads_RW, "");
    dataService.addEndpoint(OperationName.Query, "");
    dataService.addEndpoint(OperationName.Update, "");

    FusekiServer server = FusekiServer.create()
       .setPort(3332)
       .add("/data", dataService)
       .build() ;
    server.start() ;

This setup puts all the operation on the datset URL. The ``Content-type`` and any query
string is used to determine the operation.

| Service | Endpoint |
|---------|----------|
| SPARQL Query    | ``http://host:3332/ds``  |
| SPARQL Update   | ``http://host:3332/ds``  |
| GSP read-only   | ``http://host:3332/ds``  |
| GET/POST quads  | ``http://host:3332/ds``  |

### Example 4

Multiple datasets can be served by one server.

    Dataset ds1 = ...
    Dataset ds2 = ...
    FusekiServer server = FusekiServer.create()
        .add("/data1", ds1)
        .add("/data1-readonly", ds1, true)
        .add("/data2", ds2)
        .build() ;
    server.start() ;
