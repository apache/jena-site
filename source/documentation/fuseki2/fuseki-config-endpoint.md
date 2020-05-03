---
title: Fuseki Configuration - New Syntax
---

Apache Jena 3.13.0 introduces a new syntax for the facilities of a Fuseki service.

The [previous syntax](fuseki-configuration.html) is still valid.

The new syntax enables more configuration options:

* setting the context on a per-endpoint basis
* having multiple operations at the service access point, switching based on
operation type
* a more general structure for adding custom services

## Syntax

Here is an example of a server configuration that provides one operation, SPARQL
query, and then only on the dataset URL.

    PREFIX :        <#>
    PREFIX fuseki:  <http://jena.apache.org/fuseki#>
    PREFIX rdf:     <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    
    [] rdf:type fuseki:Server .
    
    <#service> rdf:type fuseki:Service ;
        fuseki:name         "dataset" ;
        fuseki:endpoint     [ fuseki:operation fuseki:query ] ;
        fuseki:dataset      <#dataset> .

    ## In memory transactional dataset initially loaded
    ##  with the contents of file "data.trig"
    <#dataset> rdf:type ja:MemoryDataset;
        ja:data "data.trig" .

This is invoked with a URL of the form
<tt>http://<i>host:port</i>/dataset?query=...</tt>
which is a SPARQl query request sent to the dataset URL.

The new syntax is the `fuseki:endpoint`.

The property `fuseki:endpoint` describes the operation available. No name is
given so the operation is available at the URL of the dataset.

`fuseki:dataset` names the dataset to be used with this data service. The syntax
and options are unchanged from the [previous syntax](fuseki-configuration.html).

In this second example:

    <#service> rdf:type fuseki:Service ;
        fuseki:name          "dataset" ;
        fuseki:endpoint     [ 
            fuseki:operation fuseki:query ;
            fuseki:name      "sparql";
        ];
        fuseki:dataset       <#dataset> .

the endpoint has a name. The URL to invoke the operation is now:

<tt>http://<i>host:port</i>/dataset/sparql?query=...</tt>

and is similar to older form:

    <#service> rdf:type fuseki:Service ;
        fuseki:name          "dataset" ;
        fuseki:serviceQuery  "sparql" ;
        fuseki:dataset       <#dataset> .

Operations on the dataset URL have the name `""` (the empty string) and this is
the default. The first example is the same as:

    <#service> rdf:type fuseki:Service ;
        fuseki:name         "dataset" ;
        fuseki:endpoint     [ 
            fuseki:operation fuseki:query ;
            fuseki:name      "" ;
        ] ;
        fuseki:dataset      <#dataset> .


The standard set of service installed by running the server from the command line
without a configuration file is:

    <#service1> rdf:type fuseki:Service ;
        fuseki:name "dataset" ;
        fuseki:endpoint [ 
            fuseki:operation fuseki:query ;
            fuseki:name "sparql" 
        ];
        fuseki:endpoint [
            fuseki:operation fuseki:query ;
            fuseki:name "query" 
        ] ;
        fuseki:endpoint [
            fuseki:operation fuseki:update ;
            fuseki:name      "update"
        ] ;
        fuseki:endpoint [
            fuseki:operation fuseki:gsp-r ;
            fuseki:name "get"
        ] ;
        fuseki:endpoint [ 
            fuseki:operation fuseki:gsp-rw ; 
            fuseki:name "data"
        ] ; 
        fuseki:endpoint [ 
            fuseki:operation fuseki:upload ;
            fuseki:name "upload"
        ] ; 
        fuseki:dataset ...

## Operations

| URI | Operation |
|-----|-----------|
| `fuseki:query`  | SPARQL 1.1 Query with ARQ extensions |
| `fuseki:update` | SPARQL 1.1 Update with ARQ extensions |
| `fuseki:gsp-r`  | SPARQL Graph Store Protocol and Quad extensions (read only) |
| `fuseki:gsp-rw` | SPARQL Graph Store Protocol and Quad extensions |
| `fuseki:upload` | HTML form file upload |
| `fuseki:no-op`  | An operation that causes a 400 or 404 error |

New operations can be added by programmatic setup in [Fuseki Main](/documentation/fuseki2/fuseki-main).

## Dispatch

"Dispatch" is the process of routing a HTTP request to a specific operation
processor implementation to handle the request.

Dispatch to named endpoint usually happens from the name alone, when there is a
unique name for an endpoint. If, however, two endpoints give the same
`fuseki:name`, or if operations are defined for the dataset itself, then
dispatch is based on a second step of determining the operation type by
inspecting the request.  Each of the SPARQL operations has a unique signature.

A query is either a GET with query string including "?query=", or a POST with a
content type of the body "application/sparql-query", or an HTML form with a field
"query="

An update is a POST where the body is "application/sparql-update" or an HTML
form with field "update=".

A GSP operation has `?default` or `?graph=`.

Quads operations have no query string and a have a `Content-Type` for a data in
a RDF triples or quads syntax.

So, for example "GET /dataset" is a request to get all the triples and quads in the
dataset. The syntax for the response is determined by content negotiation,
defaulting to `text/trig`.

Custom services usually use a named endpoint.  Custom operations
can specific a content type that they handle, which must be unique for the
operation, and they can not provide a query string signature for dispatch.

## Common Cases

This section describes a few deployment patterns:

#### Case 1: Read-only Dataset

The 2 SPARQL standard operations for a read-only dataset:

    <#service> rdf:type fuseki:Service ;
        fuseki:name     "ds-read-only" ;
        ## fuseki:name "" is optional.
        fuseki:endpoint [ fuseki:operation fuseki:query; ] ;
        fuseki:endpoint [ fuseki:operation fuseki:gsp-r; ] ;
        fuseki:dataset  <#dataset> .

This is good for publishing data.

#### Case 2: Dataset level operation.

The 3 SPARQL standard operations for a read-write dataset:

    <#service> rdf:type fuseki:Service ;
        fuseki:name     "ds-rw" ;
        ## fuseki:name "" is optional.
        fuseki:endpoint [ fuseki:operation fuseki:query; ] ;
        fuseki:endpoint [ fuseki:operation fuseki:update;] ;
        fuseki:endpoint [ fuseki:operation fuseki:gsp-rw; ] ;
        fuseki:dataset  <#dataset> .

#### Case 3: Named endpoints

    <#service1> rdf:type fuseki:Service ;
        fuseki:name     "ds-named" ;
        fuseki:endpoint [ fuseki:operation fuseki:query;  fuseki:name "sparql"  ] ;
        fuseki:endpoint [ fuseki:operation fuseki:query;  fuseki:name "query"   ] ;
        fuseki:endpoint [ fuseki:operation fuseki:update; fuseki:name "update"  ] ;
        fuseki:endpoint [ fuseki:operation fuseki:upload; fuseki:name "upload"  ] ;
        fuseki:endpoint [ fuseki:operation fuseki:gsp_r;  fuseki:name "get"     ] ;
        fuseki:endpoint [ fuseki:operation fuseki:gsp_rw; fuseki:name "data"    ] ;
        fuseki:dataset  <#dataset> .

The operation on this dataset can only be accessed as "/ds-named/sparql",
"/ds-named/update" etc, not as "/ds-named".

## Quad extensions

The GSP (SPARQL Graph Store Protocol) operations provide the HTTP operations of 
GET, POST, PUT and DELETE for specific graphs in the RDF dataset. The SPARQL GSP
standard includes identifying the target graph with `?default` or `?graph=...uri...` and
the request or response is one of the RDF triple syntaxes (Turtle, N-Triples,
JSON-LD, RDF/XML) as well as older proposals (TriX and RDF/JSON).

Apache Jena Fuseki also provides quad operations for HTTP methods 
GET, POST, PUT (not DELETE, that would be the dataset itself),
and the request or response is one of the syntaxes for datasets
(TriG, N-Quads, JSON-LD, TriX).

Fuseki also provides [/documentation/io/rdf-binary.html](RDF Binary) for triples and quads.

The quads extension applies when there is no `?default` or `?graph`.

## Context

Each operation execution is given a "context" - a set of name-value pairs.
Internally, this is used for system registries, for the fixed "current time" for
an operation. The context is the merge of the server's context, any additional
settings on the dataset and any settings for the endpoint. The merge is performed
in that order - server then dataset then endpoint.

Uses for the context setting include query timeouts and making default query pattern
matching apply to the union of named graphs, not the default graph.

In this example (prefix `tdb2:` is for URI `<http://jena.apache.org/2016/tdb#>`):

    <#servicetdb> rdf:type fuseki:Service ;
        fuseki:name         "ds-tdb" ;
        fuseki:endpoint [
            fuseki:operation fuseki:query ;
            fuseki:name      "sparql-union" ;
            ja:context [ ja:cxtName "tdb:unionDefaultGraph" ; ja:cxtValue true ] ;
        ] ;
        fuseki:endpoint [ fuseki:operation fuseki:query; ] ;
        fuseki:endpoint [ fuseki:operation fuseki:update; ] ;
        fuseki:dataset <#tdbDataset> .
    
    <#tdbDataset> rdf:type tdb2:DatasetTDB ;
        ja:context [ ja:cxtName "arq:queryTimeout" ;  ja:cxtValue "10000,30000" ] ;
        tdb2:location "DATA" .
 
"/ds-tdb" is a [TDB2 database](/documentation/tdb2/) with endpoints for SPARQL
query and update on the dataset URL. In addition, it has a named service
"/ds-tdb/sparql-union" where the query works with the union of named graphs as
the default graph.

Query timeout is set for any use of the dataset with first result in 10
seconds, and complete results in 30 seconds.

## Security

The page [Data Access Control for Fuseki](/documentation/fuseki2/data-access-control)
covers the 

For endpoints, the permitted users are part of the endpoint description.

    fuseki:endpoint [ 
        fuseki:operation fuseki:query;
        fuseki:name "sparql" ;
        fuseki:allowedUsers "user1", "user2"
    ] ;

## Legacy Behaviour

For compatibility with the older configuration behaviour, the Fuseki dispatch
code includes an additional dispatch option.

If a request is made on the dataset (no service name in the request URL), then
the dispatcher classifies the operation and looks for a named endpoint for that
operation of any name. If one is found, that is used.
