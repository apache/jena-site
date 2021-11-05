---
title: Apache Jena SPARQL APIs
slug: index
---

Jump to "[Changes](#changes)".

## Overview

The SPARQL specifications provide
[query](https://www.w3.org/TR/sparql11-query/),
[update](https://www.w3.org/TR/sparql11-update/) and the
[graph store protocol](https://www.w3.org/TR/sparql11-http-rdf-update/) (GSP).

For working with RDF data:

| API  | GPI  |
| ---- | ---- |
| `Model`       | `Graph`        |
| `Statement`   | `Triple`       |
| `Resource`    | `Node`         |
| `Literal`     | `Node`         |
| `String`      | `Var`          |
| `Dataset`     | `DatasetGraph` |
|               | `Quad` |

and for SPARQL,

| API  | GPI  |
| ---- | ---- |
| `RDFConnection`    | `RDFLink`    |
| `QueryExecution`   | `QueryExec`  |
| `UpdateExecution`  | `UpdateExec` |
| `ResultSet`        | `RowSet`     |
| `ModelStore`       | `GSP`        |

Jena provides a single interface, [`RDFConnection`](../rdfconnection) for
working with local and remote RDF data using these protocols in a unified way.
This is most useful for remote data because the setup to connect is more
complicated and can be done once and reused.

HTTP authentication support is provided, supporting both basic and digest
authentication in challenge-response scenarios. Most authentication setup is
abstracted away from the particualr HTTP client library Jena is using.

Applications can also use the various execution engines through
`QueryExecution`, `UpdateExecution` and `ModelStore`.

All the main implementations work at "Graph SPI" (GPI) level and an application
may wish to work with this lower level interface that implements generalized RDF
(i.e. a triple is any three nodes, including ones like variables, and subsystem
extension nodes).

The GPI version is the main machinery working at the storage and network level,
and the API version is an adapter to convert to the Model API and related
classes.

`UpdateProcessor` is a legacy name for `UpdateExecution`

`GSP` provides the SPARQL Graph Store Protocol, including extensions for sending
and receiving datasets, rather than individual graphs.

Both API and GPI provide builders for detailed setup, particularly for remote
usage over HTTP and HTTPS where detailed control of the HTTP requests is
sometimes necessary to work with other triple stores.

Use of the builders is preferred to factories. Factory style functions for many
common usage patterns are retained in `QueryExecutionFactory`,
`UpdateExecutionFactory`. Note that any methods that involved Apache HttpClient
objects have been removed.

## Changes from Jena 4.2.0 to Jena 4.3.0 {#changes}

* Execution objects have a companion builder. This is especially important of
  HTTP as there many configuration options that may be needed. Local use is
  still covered by the existing `QueryExecutionFactory` as well as the new
  `QueryExecutionBuilder`.

* HTTP usage provided by the JDK `java.net.http` package, with challenge-based
  authentication provided on top by Jena. [See the authentiucation documentation](./http-auth.html).

* Authentication support is uniformly applied to query, update, GSP and `SERVICE`.

* HTTP/2 support

* Remove Apache HttpClient usage
  * When using this for authentication, application code changes wil be
    necessary.

* Deprecate modifying `QueryExecution` after it is built.

* Parameterization for remote queries.
  Parameterization - replacing variables by values before sending
  a query - makes the query into a template. The same applies to updates.
  This is also provided uniformly for local queries and should be used in
  preference to the local-only "initial binding" approach which is
  similarly but not identical.

* `HttpOp`, using `java.net.http.HttpClient`, is split into `HttpRDF` for
  GET/POST/PUT/DELETE of graphs and datasets and new `HttpOp` for packaged-up
  common patterns of HTTP usage.

* The previous `HttpOp` is available as `HttpOp1` and Apache HttpClient is still
  a dependency. Eventually, `HttpOp`` and dependecy on  Apache HttpClient will be removed.

* GSP - support for dataset operations as well as graphs (also supported by Fuseki).

* `DatasetAccessor`s removed - previously these were deprecated. `GSP` and
`ModelStore` are the replacement for remote operations. `RDFConnection` and
`RDFLink` provide APIs.

## <tt>RDFConnection</tt>

[RDFConnection](../rdfconnection/)

```
    try ( RDFConnection conn = RDFConnectionRemote.service(dataURL).build()) {
        conn.update("INSERT DATA{}");
        conn.queryAsk("ASK{}");
    }
```
or the less flexible:
```
    try ( RDFConnection conn = RDFConnection.connect(dataURL) ) {
        conn.update("INSERT DATA{}");
        conn.queryAsk("ASK{}");
    }
```

## Query Execution

Builder Examples
Builders are reusable and modifiable after a "build" operation.

```
Dataset dataset = ...
Query query = ...
try ( QueryExecution qExec = QueryExecution.create()
                                 .dataset(dataset)
                                 .query(query)
                                 .build() ) {
    ResultSet results = qExec.execSelect();
    ... use results ...
}
```
and remote calls:
```
try ( QueryExecution qExec = QueryExecutionHTTP.service("http://....")
                                 .query(query)
                                 .build() ) {
    ResultSet results = qExec.execSelect();
    ... use results ...
}
```

Factory Examples

```
  Dataset dataset = ...
  Query query = ...
  try ( QueryExecution qExec = QueryExecutionFactory.create(query, dataset) ) {
       ResultSet results = qExec.execSelect();
       ... use results ...
  }
```

More complex setup:
```
// JDK HttpClient
HttpClient httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))  // Timeout to connect
                .followRedirects(Redirect.NORMAL)
                .build();
try ( QueryExecution qExec = QueryExecutionHTTP.create()
                                 .service("http:// ....")
                                 .httpClient(httpClient)
                                 .query(query)
                                 .sendMode(QuerySendMode.asPost)
                                 .timeout(30, TimeUnit.SECONDS) // Timeout of request
                                 .build() ) {
    ResultSet results = qExec.execSelect();
    ... use results ...
}
```
There is only one timeout setting for eacho HTTP query execution. The "time to
connect" is handled by the JDK `HttpClient`. Timeouts for local execution are
"time to first result" and "time to all results" as before.

## <tt>ModelStore</tt> and <tt>GSP</tt>

```
   Model model = ModelStore.service("http://fuseki/dataset").defaultGraph().GET();
```

```
   Graph graph = GSP.service("http://fuseki/dataset").defaultGraph().GET();
```

```
  Graph graph = ... ; 
  GSP.request("http://fuseki/dataset").graphName("http;//data/myGraph").POST(graph);
```

```
  DatasetGraph dataset = GSP.request("http://fuseki/dataset").getDataset();
```

## <tt>SERVICE</tt>

[Old documentation ](../query/service.html) - configuration, especially for
authentication, has changed.

## SERVICE configuration

See below for more on HTTP authentication with `SERVICE`.

The configuration of `SERVICE` operations has changed in Jena 4.3.0 and the
paramter names have changed.

| Symbol | Java Constant | Usage |
| ------ | ------------- | --- |
| `arq:httpServiceAllowed` | `ARQ.httpServiceAllowed` | False to disable |
| `arq:serviceParams`      | `ARQ.serviceParams`    | Map |
| `arq:httpQueryTimeout`   | `ARQ.httpQueryTimeout` | Request timeout (time to completion) |
| `arq:httpQueryClient`    | `ARQ.httpQueryCient`   | An `java.net.http.HttpClient` object |
| `arq:httpQueryCompression` |  | no-op |

where `arq:` is prefix for `<http://jena.apache.org/ARQ#>`.

The timeout is now only for the overall request and manged by the HTTP client
code.

Compression of responses is not currently supported.

## Customization of HTTP requests

There is a mechanism to modify HTTP requests to specific endpoints or to a
collection of endpoints with the same prefix.

For example, to add a header `X-Tracker` to each request to a particular server:

```java
    AtomicLong counter = new AtomicLong(0);

    HttpRequestModifier modifier = (params, headers)->{
        long x = counter.incrementAndGet();
        headers.put("X-Tracker", "Call="+x);
    };
    // serverURL is the HTTP URL for the server or part of the server HTTP space.
    RegistryRequestModifier.get().addPrefix(serverURL, modifier);
```

The `RegistryRequestModifier` registry is checked on each HTTP operation. It
maps URLs or prefix of URLs to a function of interface `HttpRequestModifier`
which has access to the headers and the query string parameters of the request.

## Authentication {#auth}

[Documentation for authentication](./http-auth.html).
