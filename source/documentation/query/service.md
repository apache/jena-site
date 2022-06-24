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

The `SERVICE` operation in a SPARQL query may be configured via the Context. 
The values for configuration can be set in the global context (accessed via 
`ARQ.getContext()`) or in the per-query execution context.

The prefix `arq:` is `<http://jena.apache.org/ARQ#>`.

Symbol | Java Constant | Default
------ | ------------- | -------
`arq:httpServiceAllowed`  | `ARQ.httpServiceAllowed` | true
`arq:httpQueryClient`     | `ARQ.httpQueryClient`    | System default.
`arq:httpServiceSendMode` | `ARQ.httpServiceSendMode | unset

#### `arq:httpServiceAllowed`

This setting can be used to disable execution of any SERVICE request in query. 
Set to "false" to prohibit SERVICE requests.

#### `arq:httpQueryClient`

The java.net.http HttpClient object to use for SERVICE execution.

#### `arq:httpServiceSendMode`

The HTTP operation to use. The value is a string or a `QuerySendMode` object.

String settings are:

Setting | Effect
------- | ------
"POST"               | Use HTTP POST. Same as "asPost".
"GET"                | Use HTTP GET unconditionally. Same as "asGetAlways".
"asGetAlways"        | Use HTTP GET.
"asGetWithLimitBody" | Use HTTP GET upto a size limit (usually 2kbytes).
"asGetWithLimitForm" | Use HTTP GET upto a size limit (usually 2kbytes), and use a HTML form for the query.
"asPostForm"         | Use HTTP POST and use an HTML form for the query.
"asPost"             | Use HTTP POST.


## Old Context setting

Old settings are honored where possible but should not be used:

The prefix  `srv:` is the IRI `<http://jena.hpl.hp.com/Service#>`.


Symbol | Usage | Default
------ | ----- | -------
`srv:queryTimeout` | Set timeouts | none
`srv:queryCompression` | Enable use of deflation and GZip | true
`srv:queryClient` | Enable use of a specific client | none
`srv:serviceContext` | Per-endpoint configuration | none

#### `srv:queryTimeout`

As documented above.

#### `srv:queryCompression`

Sets the flag for use of deflation and GZip.

Boolean: True indicates that gzip compressed data is acceptable.

#### `srv:queryClient`

Enable use of a specific client

Provides a slot for a specific [HttpClient][1] for use with a specific `SERVICE`

#### `srv:serviceContext`

Provides a mechanism to override system context settings on a per URI basis.

The value is a `Map<String,Context>` where the map key is the URI of the service endpoint, and the `Context` is a set of values to override the default values.

If a context is provided for the URI, the system context is copied and the
context for the URI is used to set specific values.  This ensures that any URI
specific settings will be used.

[1]: https://hc.apache.org/httpcomponents-client-ga/httpclient/apidocs/org/apache/http/client/HttpClient.html
