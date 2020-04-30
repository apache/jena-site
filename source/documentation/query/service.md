---
title: ARQ - Basic Federated SPARQL Query
---

There are already ways to access remote RDF data. The simplest is
to read a document which is an RDF graph and query it. Another way
is with the
[SPARQL protocol](http://www.w3.org/TR/rdf-sparql-protocol/) which
allows a query to be sent to a remote service endpoint and the
results sent back (in RDF, or an
[XML-based results format](http://www.w3.org/TR/rdf-sparql-XMLres/)
or even a [JSON one](http://www.w3.org/TR/rdf-sparql-json-res/)).

`SERVICE` is a feature of SPARQL 1.1 that allows an executing query
to make a SPARQL protocol to another SPARQL endpoint.

## Syntax

    PREFIX : <http://example/>
    PREFIX  dc:     <http://purl.org/dc/elements/1.1/>

    SELECT ?a
    FROM <mybooks.rdf>
    {
      ?b dc:title ?title .
      SERVICE <http://sparql.org/books>
         { ?s dc:title ?title . ?s dc:creator ?a }
    }

## Algebra

There is an operator in the algebra.

    (prefix ((dc: <http://purl.org/dc/elements/1.1/>))
      (project (?a)
        (join
          (BGP [triple ?b dc:title ?title])
          (service <http://sparql.org/books>
              (BGP
                [triple ?s dc:title ?title]
                [triple ?s dc:creator ?a]
              ))
          )))

## Performance Considerations

This feature is a basic building block to allow remote access in
the middle of a query, not a general solution to the issues in
distributed query evaluation. The algebra operation is executed
without regard to how selective the pattern is. So the order of the
query will affect the speed of execution. Because it involves HTTP
operations, asking the query in the right order matters a lot.
Don't ask for the whole of a bookstore just to find a book whose
title comes from a local RDF file - ask the bookshop a query with
the title already bound from earlier in the query.

## Controlling `SERVICE` requests.

The `SERVICE` operation in a SPARQL query may be configured via the Context. The values for configuration can be set in the global context (accessed via 
`ARQ.getContext()`) or in the per-query execution context.

The prefix  `srv:` is the IRI `<http://jena.hpl.hp.com/Service#>`.

### Configuration from Jena version 3.1.1

Symbol | Usage | Default
------ | ----- | -------
`srv:queryTimeout` | Set timeouts | none
`srv:queryCompression` | Enable use of deflation and GZip | true
`srv:queryClient` | Enable use of a specific client | none
`srv:queryContext` | Per-endpoint configuration | none

#### `srv:queryTimeout`

As documented above.


#### `srv:queryCompression`

Sets the flag for use of deflation and GZip.

Boolean: True indicates that gzip compressed data is acceptable.

#### `srv:queryClient`

Enable use of a specific client

Provides a slot for a specific [HttpClient][1] for use with a specific `SERVICE`

#### `srv:serviceContext`

As documented above.

[ARQ documentation index](index.html)

[1]: https://hc.apache.org/httpcomponents-client-ga/httpclient/apidocs/org/apache/http/client/HttpClient.html

### Configuration for Jena version 3.0.0 through 3.1.0

Symbol | Usage
------ | -----
`srv:queryTimeout` | Set timeouts 
`srv:queryGzip` | Enable use of GZip
`srv:queryDeflate` | Enable use of deflate
`srv:queryAuthUser` | Basic authentication
`srv:queryAuthPwd` |  Basic authentication
`srv:queryContext` | Per-endpoint configuration

#### `srv:queryTimeout`

Set the connect and read timeouts for the query.

If a timeout occurs a QueryExceptionHTTP is thrown.  The cause of that exception will be a java.net.SocketTimeoutException.

Number: number of milliseconds for connect timeout.

String: number of milliseconds for connect timeout.  If string is of the form “X,Y” the first number is the number of milliseconds for the connect timeout and the seconds is the number of milliseconds for the read timeout.

Connect timeout =0
read timeout = 0

Values of 0 indicate no timeout and service operation will wait until the remote server responds.

#### `srv:queryGzip`

Sets the allow Gzip flag.

Boolean: True indicates that gzip compressed data is acceptable.
false

#### `srv:queryDeflate`

Sets the allow Deflate flag.

Boolean: True indicates that deflate compression is acceptable
False

#### `srv:queryAuthUser`

Sets the user id for basic auth.

String: The user id to log in with

If null or null length no user id is sent.

#### `srv:queryAuthPwd`

Sets the password for basic auth.

String: The password to log in with.

If null or null length no password is sent.

#### `srv:serviceContext`
Provides a mechanism to override system context settings on a per URI basis.

The value is a `Map<String,Context>` where the map key is the URI of the service endpoint, and the `Context` is a set of values to override the default values.

If a context is provided for the URI the system context is copied and the URI specific values are then copied in.  This ensures that any URI specific settings will be used.
