---
title: Extensions in ARQ
---

There are several ways to extend the ARQ query engine within the
SPARQL syntax.

-   [Expression Functions](#value-functions) - additional operations in
    `FILTERS`, `BIND` and `SELECT` expressions.
-   [Property functions](#property-functions) - adding predicates
    that introduce custom query stages
-   [DESCRIBE handlers](#describe-handlers)
-   Support for
    [finding blank nodes by label](#match-blank-node-labels)
-   [Extending query evaluation](arq-query-eval.html) for querying
    different storage and inference systems

Functions are standard part of SPARQL. ARQ provides
application-written functions and provides a
[function library](library-function.html). Applications can
[write and register their own functions](writing_functions.html).

Property functions provide a way to provide custom matching of
particular predicates. They enable triple matches to be calculated,
rather than just looked up in a RDF graph and they are a way to add
functionality and remain within SPARQL. ARQ has a
[property function library](library-propfunc.html). Applications
can
[write and register their own property functions](writing_propfuncs.html).

The [free text support in ARQ](/documentation/query/text-query.html/) is provided by
[Lucene](http://lucene.apache.org/java/docs/index.html), using
property functions.

## Filter Functions

A SPARQL custom function is implementation dependent. Most details
of the ARQ query engine do not have to be understood to write a
function; it is a matter of implementing one interface.  This is
made simpler for many cases by a number of base classes that
provide much of the machinery needed.

### Function Registry

Functions can be installed into the function registry by the
application. The function registry is a mapping from URI to a
factory class for functions (each time a function is mentioned in a
query, a new instance is created) and there is an auto-factory
class so just registering a Java class will work. A function can
access the queried dataset.

### Dynamically Loaded Functions

The ARQ function library uses this mechanism.  The namespace of the
ARQ function library is `<http://jena.apache.org/ARQ/function#>`.

    PREFIX afn: <http://jena.apache.org/ARQ/function#>
    PREFIX dc: <http://purl.org/dc/elements/1.1/>
    SELECT ?v { 
        ?x dc:date ?date . 
        FILTER (?date < afn:now() )
    }

The afn:now returns the time the query started.

The expression functions in the ARQ distribution are described on the
[expression function library page](library-function.html).

URIs for functions in the (fake)
[URI scheme `java:`](java-uri.html) are dynamically loaded. The
class name forms the scheme specific part of the URI.

## Property functions

Property functions, sometimes called "magic properties", are
properties that cause triple matching to happen by executing some
piece of code, determined by the property URI, and not by the usual
graph matching. They can be used to give certain kinds of inference
and rule processing. Some calculated properties have additional,
non-declarative requirements such as needing one of other of the
subject or object to be a query constant or a bound value, and not
able to generate all possibilities for that slot.

Property functions must have fixed URI for the predicate (it can't
be query variable). They may take a list for subject or object.

One common case is for access to collections (RDF lists) or
containers (rdf:Bag, rdf:Seq, rdf:Alt).

    PREFIX list: <http://jena.apache.org/ARQ/list#>
    SELECT ?member { 
        ?x :p ?list .     # Some way to find the list 
        ?list list:member ?member .
    }

which can also be written:

    PREFIX list: <http://jena.apache.org/ARQ/list#>
    SELECT ?member { 
        ?x :p [ list:member ?member ] 
    }

Likewise, RDF containers:

    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    SELECT ?member { 
        ?x :p ?bag .     # Some way to find the bag 
        ?bag rdfs:member ?member .
    }

Property functions can also take lists in the subject or object
slot.

Code for properties can be dynamically loaded or pre-registered.
For example, `splitIRI` will take an IRI and assign the namespace
ad localname parts to variables (if the variables are already
bound, not constants are used, `splitIRI` will check the values).

    PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
    PREFIX apf: <java:org.apache.jena.query.pfunction.library.>
    SELECT ?namespace ?localname { 
        xsd:string apf:splitIRI (?namespace ?localname) 
    }

Property functions might conflict with inference rules and it can
be turned off by the Java code:

     ARQ.setFalse(ARQ.enablePropertyFunctions) ;

or on a per instance basis:

     try(QueryExecution qExec = ... ) {
         qExec.getContext().setFalse(ARQ.enablePropertyFunctions) ;
         ...
     }

The property functions in the ARQ distribution are described on the
[property function library page](library-propfunc.html).

URIs for functions in the (fake)
[URI scheme `java:`](java-uri.html) are dynamically loaded. The
class name forms the scheme specific part of the URI.

## DESCRIBE handlers

The `DESCRIBE` result form in SPARQL does not define an exact form
of RDF to return. Instead, it allows the server or query processor
to return what it considers to be an appropriate description of the
resources located. This description will be specific to the domain,
data modelling or application.

ARQ comes with one built-in handler which calculates the blank node
closure of resources found. While suitable for many situations, it
is not general (for example, a [FOAF](http://www.foaf-project.org/)
file usually consists of all blank nodes). ARQ allows the
application to replace or add handlers for producing `DESCRIBE`
result forms.

Application-specific handlers can be added to the
`DescribeHandlerRegistry`. The handler will be called for each
resource (not literals) identified by the `DESCRIBE` query.

## Blank Node Labels

URIs from with scheme name "\_" (which is illegal) are created as
blank node labels for directly accessing a blank node in the
queried graph or dataset. These are constant terms in the query -
not unnamed variables. Do not confuse these with the standard
qname-like notation for blank nodes in queries. This is not
portable - use with care.

    <_:1234-5678-90> # A blank node in the data

    _:b0 # A blank node in the query - a variable
