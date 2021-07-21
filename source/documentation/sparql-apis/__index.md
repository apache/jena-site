---
title: Apache Jena SPARQL APIs
slug: index
---
TOC

## Overview

The SPARQL specifications provide
[query](https://www.w3.org/TR/sparql11-query/),
[update](https://www.w3.org/TR/sparql11-update/) and the
[graph store protocol](https://www.w3.org/TR/sparql11-http-rdf-update/) (GSP).

Jena provides a single interface, [`RDFConnection`](../rdfconnection) for working
with local and remote RDF data using these protools in a unified way for local
and remote data.

HTTP Authentication is provides for remte operations.

Applications can also use the different parts, such as query directly when they
want additional control.

The GPI, also called the "Graph SPI" - this is the lower level interface that
implements generalized RDF (i.e. a triple is any three nodes, including ones
like variables, and subsystem extension nodes).


| API  | GPI  |
| ---- | ---- |
| `Dataset`     | `DatasetGraph` |
| `Model`       | `Graph`        |
| `Statement`   | `Triple`       |
| `Resource`    | `Node`         |
| `Literal`     | `Node`         |
| `String`      | `Var`          |

For SPARQL,

| API  | GPI  |
| ---- | ---- |
| `RDFConnection`    | `RDFLink`    |
| `QueryExecution`   | `QueryExec`  |
| `UpdateExecution`  | `UpdateExec` |
| `ResultSet`        | `RowSet`     |
|                    | `GSP`        |
|                    | `SERVICE`    |

The GPI version is the main machinery working at the storage and network level,
and the API version is an adapter to convert to the Model API and related
classes.

This documentation describes the API classes - the GPI companion classes are the
same style, sometimes with slightly changed naming.

`UpdateProcessor` is a legacy name for `UpdateExecution`

`GSP` provides the SPARQL Graph Store Protocol, incliding extensions for sending
and receiving datasets, rather than graphs. 

## Changes from Jena 4.1.0 to Jena 4.?.0

* Execution object have a companion builder. 
  This is especially important of HTTP
  as there a lot of configuration options that may be needed.

* HTTP usage provided by the JDK `java.net.http` package, with challenage
authentication provides on top by Jena. See below.

* Authentication support is uniformly appied to query, update GSP and SPARQL `SERVICE`.

* HTTP/2 support (Fuseki to follow unless done and tested in time).

* Remove Apache HttpClient usage
  * When using this for authentication, applciation code chnages wil be
    necessary.

* Deprecate modfying `QueryExecution` after it is built.
  This is still supported for local `QueryExecution`.

* Parameterization for remote queries

* `HttpOp` is split into `HttpRDF` for GET/POST/PUT/DELETE of graphs and
  datasets and new `HttpOp` for packaged up common patterns of HTTP usage.

* DatasetAccessors will be removed.

* GSP - support for dataset operations as well as graphs (also supported by Fuseki).

## <tt>RDFConnection</tt>

[RDFConnection](../rdfconnection/)

```
example with builder.
```
```
example with factory
```


## Query Execution

Factory Examples

Builder Examples


```
try ( QueryExecution qExec = QueryExecution.create()
                                 .dataset(dataset)
                                 .query(query)
                                 .build() ) {
    ResultSet resulrs = qExec.execSelect();
    ... use results ...
}
```

```
try ( QueryExecution qExec = QueryExecutionHTTP.create()
                                 .service("http:// ....")
                                 .query(query)
                                 .build() ) {
    ResultSet resulrs = qExec.execSelect();
    ... use results ...
}
```

```
// JDK
HttpClient httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .followRedirects(Redirect.NORMAL)
                .build();
try ( QueryExecution qExec = QueryExecutionHTTP.create()
                                 .service("http:// ....")
                                 .httpClient(httpClient)
                                 .query(query)
                                 .sendMode(QuerySendMode.asPost)
                                 .timeout(30, TimeUnit.SECONDS)
                                 .build() ) {
    ResultSet resulrs = qExec.execSelect();
    ... use results ...
}
```
There is only one timeout setting for HTTP query execution. The "time to
connect" is handled by the JDK `HttpClient`. Timeouts for local execution are
"time to first result" and "time to all results" as before.

## <tt>GSP</tt>

```
  Graph graph = GSP.request("http://fuseki/dataset").defaultGraph().GET();
```

```
  Graph graph = ... ; 
  GSP.request("http://fuseki/dataset").graphName("http;//data/myGraph").POST(graph);
```

```
  DatasetGraph dataset = GSP.request("http://fuseki/dataset").getDataset();
```


## Customization of HTTP requests
@@

Params (e.g. apikey)

ARQ.httpRequestModifer

## <tt>SERVICE</tt>
@@
[Old documentation ](../query/service.html) - passing parameters has changed.

## Misc 

Request modifiers
Params

### ARQ.httpRequestModifer

## Authentication

For any use of users-password information, and especially HTTP basic
authentication, information is visible in the HTTP headers. Using HTTPS is
necessary to avoid snoppping.  Digest authentication is also stronger over HTTPS
because it protects againats man-in-the-middle attacks.

4 kinds:

1. Basic authentication
2. Challenge-Basic authentication
3. Challenge-Digest authentication
4. URL userinfo (`users:passwrd@host.net`)

Basic authentication occurs where the app provides the users and password
information to the JDK `HttpClient` and that information is always used when
sending HTTP requests with that `HttpClient`. It does not require an initial
request-challenge-resend to initiate. This is provided natively by the `java.net.http`
JDK code. See `HttpClient.newBuilder().authenticate(...)`.

Challenge based authentication, for "basic" or "disgest", are provided by Jena.
The challenge happens on the first contact with the remote endpoint and the
server returns a 401 response with an HTTP header saying which style of
authentication is required. There is a registry of users name and password for
endpoints which is consulted and the appropriate
[`Authorization:`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Authorization)
header is generated then the request resent. If no registration matches, the 401
is passed back to the application as an exception.

Because it is a challenge response to an request, the first request must be
repeated, first to trigger the challenge and then again with the HTTP
authentication information.  To make this auotmatic, the first request must not be a streaming
request (the stream is not repeatable). All HTTP request generated by Jena are reapeatible.

While Jena supports user information in URLs using the URI `userinfo` part foa
URI, this is inherently unsafe because the password is in-clear in the SPARQL
query.

### JDK HttpClient.authenticator

### Challenge registration

`AuthEnv`

### <tt>SERVICE</tt>

The previous authentication mecanism work with SPARQL queries using `SERVICE`.

Params.

Disable.


1/ HttpClient

2/ ?? ARQ.httpRequestModifer

3/ (digest and basic)
Register username/password
Including presetting (basic) authentication into the local system

4/ Modifiers (not auth)

Old still supported:
source/documentation/query/http-auth.md


## @@

Links:

source/documentation/query/__index.md
