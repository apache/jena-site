---
title: "RDF Connection : SPARQL operations API"
slug: index
---

`RDFConnection` provides a unified set of operations for working on RDF
with SPARQL operations. It provides <a
href="https://www.w3.org/TR/sparql11-query/">SPARQL Query</a>, <a
href="https://www.w3.org/TR/sparql11-update/">SPARQL Update</a> and the <a
href="https://www.w3.org/TR/sparql11-http-rdf-update/">SPARQL Graph
Store</a> operations.  The interface is uniform - the same interface
applies to local data and to remote data using HTTP and the SPARQL
protocols ( <a href="https://www.w3.org/TR/sparql11-protocol/">SPARQL
protocol</a> and <a
href="https://www.w3.org/TR/sparql11-http-rdf-update/">SPARQL Graph Store
Protocol</a>).

## Outline

`RDFConnection` provides a number of different styles for working with RDF
data in Java.  It provides support for try-resource and functional code
passing styles, as well the more basic sequence of methods calls.

For example: using `try-resources` to manage the connection, and perform two operations, one to load
some data, and one to make a query can be written as:

    try ( RDFConnection conn = RDFConnectionFactory.connect(...) ) {
        conn.load("data.ttl") ;
        conn.querySelect("SELECT DISTINCT ?s { ?s ?p ?o }", (qs)->
           Resource subject = qs.getResource("s") ;
           System.out.println("Subject: "+subject) ;
        }) ;
    }

This could have been written as (approximately -- the error handling is better
in the example above):

    RDFConnection conn = RDFConnectionFactory.connect(...)
    conn.load("data.ttl") ;
    QueryExecution qExec = conn.query("SELECT DISTINCT ?s { ?s ?p ?o }") ;
    ResultSet rs = qExec.execSelect() ;
    while(rs.hasNext()) {
        QuerySolution qs = rs.next() ;
        Resource subject = qs.getResource("s") ;
        System.out.println("Subject: "+subject) ;
    }
    qExec.close() ;
    conn.close() ;

Jena also provides a separate
[SPARQL over JDBC driver](/documentation/jdbc/index.html)
library.

## Transactions

Transactions are the preferred way to work with RDF data.
Operations on an `RDFConnection` outside of an application-controlled
transaction will cause the system to add one for the duration of the
operation. This "autocommit" feature may lead to inefficient operations due
to excessive overhead.

The `Txn` class provides a Java8-style transaction API.  Transactions are
code passed in the `Txn` library that handles the transaction lifecycle.

    try ( RDFConnection conn = RDFConnectionFactory.connect(...) ) {
        Txn.execWrite(conn, ()-> {
            conn.load("data1.ttl") ;
            conn.load("data2.ttl") ;
            conn.querySelect("SELECT DISTINCT ?s { ?s ?p ?o }", (qs)->
               Resource subject = qs.getResource("s") ;
               System.out.println("Subject: "+subject) ;
            }) ;
        }) ;
    }

The traditional style of explicit `begin`, `commit`, `abort` is also available.

    try ( RDFConnection conn = RDFConnectionFactory.connect(...) ) {
        conn.begin(ReadWrite.WRITE) ;
        try {
            conn.load("data1.ttl") ;
            conn.load("data2.ttl") ;
            conn.querySelect("SELECT DISTINCT ?s { ?s ?p ?o }", (qs)->
               Resource subject = qs.getResource("s") ;
               System.out.println("Subject: "+subject) ;
            }) ;
            conn.commit() ;
        } finally { conn.end() ; }
    }

The use of `try-finally` ensures that transactions are properly finished.
The `conn.end()` provides an abort in case an exception occurs in the
transaction and a commit has not been issued.  The use of `try-finally`
ensures that transactions are properly finished.

`Txn` is wrapping these steps up and calling the application supplied code
for the transaction body.

### Remote Transactions

SPARQL does not define a remote transaction standard protocol. Each remote
operation should be atomic (all happens or nothing happens) - this is the
responsibility of the remote server.

An `RDFConnection` will at least provide the client-side locking features.
This means that overlapping operations that change data are naturally
handled by the transaction pattern within a single JVM.

## Configuring a remote `RDFConnection`.

The default settings on a remote connection should work for any SPARQL
triple store endpoint which supports HTTP content negotiation. Sometimes
different settings are desirable or required and `RDFConnectionRemote` provides a
builder to construct `RDFConnectionRemote`s.

At its simplest, it is:

    RDFConnectionRemoteBuilder builder = RDFConnection.create()
                .destination("http://host/triplestore");

which uses default settings used by `RDFConenctionFactory.connect`.

See [example
4](https://github.com/apache/jena/blob/master/jena-rdfconnection/src/main/java/org/apache/jena/rdfconnection/examples/RDFConnectionExample4.java)
and [example
5](https://github.com/apache/jena/blob/master/jena-rdfconnection/src/main/java/org/apache/jena/rdfconnection/examples/RDFConnectionExample5.java).

There are many options, including setting HTTP headers for content types
([javadoc](/documentation/javadoc/rdfconnection/index.html))
and providing detailed configuration with
[Apache HttpComponents HttpClient](https://hc.apache.org/httpcomponents-client-ga/).

### Fuseki Specific Connection

If the remote destination is a Apache Jena Fuseki server, then the
default general settings work but it is possible to have a specialised connection

        RDFConnectionRemoteBuilder builder = RDFConnectionFuseki.create()
              .destination("http://host/fuseki");

which uses settings tuned to Fuseki, including round-trip handling of
blank nodes.

See [example
6](https://github.com/apache/jena/blob/master/jena-rdfconnection/src/main/java/org/apache/jena/rdfconnection/examples/RDFConnectionExample6.java).

## Graph Store Protocol

The <a href="https://www.w3.org/TR/sparql11-http-rdf-update/">SPARQL Graph
Store Protocol</a> (GSP) is a set of operations to work on whole graphs in a
dataset.  It provides a standardised way to manage the data in a dataset.

The operations are to fetch a graph, set the RDF data in a graph,
add more RDF data into a graph, and delete a graph from a dataset.

For example: load two files:

    try ( RDFConnection conn = RDFConnectionFactory.connect(...) ) {
        conn.load("data1.ttl") ;
        conn.load("data2.nt") ;
      }

The file extension is used to determine the syntax.

There is also a set of scripts to help do these operations from the command
line with [SOH](/documentation/fuseki2/soh.html).
It is possible to write curl scripts as well.  The SPARQL Graph
Store Protocol provides a standardised way to manage the data in a dataset.

In addition, `RDFConnection` provides an extension to give the same style
of operation to work on a whole dataset (deleting the dataset is not
provided).

    conn.loadDataset("data-complete.trig") ;

### Local vs Remote

GSP operations work on while models and datasets. When used on a remote connection,
the result of a GSP operation is a separate copy of the remote RDF data.  When working
with local connections, 3 isolation modes are available:

* Copy &ndash; the models and datasets returned are independent copies.
Updates are made to the return copy only. This is most like
a remote connection and is useful for testing.
* Read-only &ndash; the models and datasets are made read-only but any changes
to the underlying RDF data by changes by another route will be visible.
This provides a form of checking for large datasets when "copy" is impractical.
* None &ndash; the models and datasets are passed back with no additional wrappers
and they can be updated with the changes being made the underlying dataset.

The default for a local `RDFConnection` is "none". When used with TDB,
accessing returned models must be done with <a href="../txn">transactions</a>
in this mode.

## Query Usage

`RDFConnection` provides methods for each of the SPARQL query forms (`SELECT`,
`CONSTRUCT`, `DESCRIBE`, `ASK`) as well as a way to get the lower level
`QueryExecution` for specialized configuration.

When creating an `QueryExecution` explicitly, care should be taken to close
it. If the application wishes to capture the result set from a SELECT query and
retain it across the lifetime of the transaction or `QueryExecution`, then
the application should create a copy which is not attached to any external system
with `ResultSetFactory.copyResults`.

      try ( RDFConnection conn = RDFConnectionFactory.connect("foo") ) {
          ResultSet safeCopy =
              Txn.execReadReturn(conn, ()-> {
                  // Process results by row:
                  conn.querySelect("SELECT DISTINCT ?s { ?s ?p ?o }", (qs)->{
                      Resource subject = qs.getResource("s") ;
                      System.out.println("Subject: "+subject) ;
                  }) ;
                  ResultSet rs = conn.query("SELECT * { ?s ?p ?o }").execSelect() ;
                  return ResultSetFactory.copyResults(rs) ;
              }) ;
      }

## Update Usage

SPARQL Update operations can be performed and mixed with other operations.

      try ( RDFConnection conn = RDFConnectionFactory.connect(...) ) {
          Txn.execWrite(conn, ()-> {
             conn.update("DELETE DATA { ... }" ) ;
             conn.load("data.ttl") ;
             }) ;

## Dataset operations

In addition to the SPARQL Graph Store Protocol, operations on whole
datasets are provided for fetching (HTTP GET), adding data (HTTP POST) and
setting the data (HTTP PUT) on a dataset URL.  This assumes the remote
server supported these REST-style operations.  Apache Jena Fuseki does
provide these.

## Subinterfaces

To help structure code, the `RDFConnection` consists of a number of
different interfaces.  An `RDFConnection` can be passed to application code
as one of these interfaces so that only certain subsets of the full
operations are visible to the called code.

* query via `SparqlQueryConnection`
* update via `SparqlUpdateConnection`
* graph store protocol `RDFDatasetAccessConnection` (read operations),
   and `RDFDatasetConnection` (read and write operations).

## Examples

* for simple usage examples see <a href="https://github.com/apache/jena/tree/master/jena-rdfconnection/src/main/java/org/apache/jena/rdfconnection/examples">https://github.com/apache/jena/tree/master/jena-rdfconnection/src/main/java/org/apache/jena/rdfconnection/examples</a>.
* for example of how to use with StreamRDF see <a href="https://github.com/apache/jena/blob/master/jena-examples/src/main/java/org/apache/jena/example/streaming/StreamRDFToConnection.java">https://github.com/apache/jena/blob/master/jena-examples/src/main/java/org/apache/jena/example/streaming/StreamRDFToConnection.java</a>.
