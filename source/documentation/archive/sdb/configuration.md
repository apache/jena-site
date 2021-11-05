---
title: SDB Configuration
---

This page describes the configuration options available. These are
options for query processing, not for the database layout and
storage, which is controlled by
[store descriptions](store_description.html "SDB/Store Description").

## Contents

-   [Setting Options](#setting-options)
-   [Current Options](#current-options)
    -   [Queries over all Named Graphs](#queries-over-all-named-graphs)
    -   [Streaming over JDBC](#streaming-over-jdbc)
    -   [Annotated SQL](#annotated-sql)


## Setting Options

Options can be set globally, throughout the JVM, or on a per query
execution basis. SDB uses the same mechanism as
[ARQ](http://jena.sf.net/ARQ "http://jena.sf.net/ARQ").

There is a global context, which is give to each query
execution as it is created. Modifications to the global context
after the query execution is created are not seen by the query
execution. Modifications to the context of a single query execution
do not affect any other query execution nor the global context.

A context is a set of symbol/value pairs. Symbols are used created
internal to ARQ and SDB and access via Java constants. Values are
any Java object, together with the values `true` and `false`, which
are short for the constants of class `java.lang.Boolean`.

Setting globally:

     SDB.getContext().set(symbol, value) ;

Per query execution:

     QueryExecution qExec = QueryExecutionFactory.create(...) ;
     qExec.getContext.set(symbol, value) ;

Setting for a query execution happens before any query compilation
or setup happens. Creation of a query execution object does not
compile the query, which happens when the appropriate `.exec`
method is called.

## Current Options

Symbol | Effect | Default
------ | ------ | -------
`SDB.unionDefaultGraph` | Query patterns on the default graph match against the union of the named graphs. | false
`SDB.jdbcStream` | Attempt to stream JDBC results. | true
`SDB.jdbcFetchSize` | Set the JDBC fetch size on the SQL query statements. Must be \>= 0. | unset
`SDB.streamGraphAPI` | Stream Jena APIs (also requires `jdbcStream` and `jdbcFetchSize` | false
`SDB.annotateGeneratedSQL` | Put SQL comments in SQL | true

### Queries over all Named Graphs

All the named graphs can be treated as a single graph in two ways:
either set the SDB option above or use the URI that refers to RDF
merge of the named graphs (`urn:x-arq:UnionGraph`).

When querying the RDF merge of named graph, the default graph in
the store is not included.

This feature applies to queries only. It does not affect the
storage nor does it change loading.

To find out which named graph a triple can be found in, use `GRAPH`
as usual.

The following special IRIs exist for use as a graph name in `GRAPH`
only:

-   `<urn:x-arq:DefaultGraph>` – the default graph, even when
    option for named union queries is set.
-   `<urn:x-arq:UnionGraph>` – the union of all named graphs, even
    when the option for named union queries is not set.

### Streaming over JDBC

By default, SDB processes results from SQL statements in a
streaming fashion. It is important to close query execution
objects, especially if not consuming all the results, because that
causes the underlying JDBC result set to be closed. JDBC result
sets can be a scarce system resource.

If this option is set, but the JDBC connection is not streaming,
then this feature is harmless. Setting it false caused SDB to read
all results of an SQL statement at once, treating streamed
connections as unstreamed.

Note that this only streams results end-to-end if the underlying
JDBC connection itself is set up to stream. Most do not in the
default configuration to reduce transient resource peaks on the
server under load.

Setting the fetch size enables cursors in some databases but there
may be restrictions imposed by the database. See the documentation
for your database for details.

In addition, operations on the graph API can be made streaming by
also setting the Graph API to streaming.

### Annotated SQL

SQL generation can include SQL comments to show how SPARQL has been
turned into SQL. This option is `true` by default and always set
for the command `sdbprint`.

    SDB.getContext().setFalse(SDB.annotateGeneratedSQL) ;



