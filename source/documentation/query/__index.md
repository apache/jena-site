---
title: ARQ - A SPARQL Processor for Jena
slug: index
---

ARQ is a query engine for [Jena](https://jena.apache.org/) that
supports the
[SPARQL RDF Query language](http://www.w3.org/TR/sparql11-query/).
SPARQL is the query language developed by the W3C
[RDF Data Access Working Group](http://www.w3.org/2001/sw/DataAccess/).

## ARQ Features

- Standard SPARQL
- Free text search via Lucene
- SPARQL/Update
- Access and extension of the SPARQL algebra
- Support for custom filter functions, including javascript functions
- Property functions for custom processing of semantic
    relationships
- Aggregation, GROUP BY and assignment as SPARQL extensions
- Support for federated query
- Support for extension to other storage systems
- Client-support for remote access to any SPARQL endpoint

## Introduction

- [A Brief Tutorial on SPARQL](/tutorials/sparql.html)
- [Application API](app_api.html) - covers the majority of
    application usages
- [Frequently Asked Questions](faq.html)
- [ARQ Support](support.html)
- Application [javadoc](/documentation/javadoc/arq/index.html)
- [Command line utilities](cmds.html)
- [Querying remote SPARQL services](sparql-remote.html)
  - [HTTP Authentication for ARQ](http-auth.html)
- [Logging](logging.html)
- [Explaining queries](explain.html)
- [Tutorial: manipulating SPARQL using ARQ](manipulating_sparql_using_arq.html)
- [Basic federated query (`SERVICE`)](service.html)
- [Property paths](property_paths.html)
- [GROUP BY and counting](group-by.html)
- [SELECT expressions](select_expr.html)
- [Sub-SELECT](sub-select.html)
- [Negation](negation.html)

Features of ARQ that are legal SPARQL syntax

- [Conditions in FILTERs](function_forms.html)
- [Free text searches](text-query.html)
- [Accessing lists](rdf_lists.html) (RDF collections)
- [Extension mechanisms](extension.html)
  - [Custom Expression Functions](extension.html#valueFunctions)
  - [Property Functions](extension.html#property-functions)
- Library
  - [Expression function library](library-function.html)
  - [Property function library](library-propfunc.html)
- [Writing SPARQL functions](writing_functions.html)
- [Writing SPARQL functions in JavaScript](javascript-functions.html)
- [Custom execution of `SERVICE`](custom_service_executors.html)
- [Constructing queries programmatically](programmatic.html)
- [Parameterized query strings](parameterized-sparql-strings.html)
- [ARQ and the SPARQL algebra](algebra.html)
- [Extending ARQ query execution and accessing different storage implementations](arq-query-eval.html)
- [Custom aggregates](custom_aggregates.html)
- [Caching and bulk-retrieval for SERVICE](service_enhancer.html)

## Extensions

Feature of ARQ that go beyond SPARQL syntax. 

- [RDF-star](https://w3c.github.io/rdf-star/)
- Operators and functions
    `[MOD](https://www.w3.org/TR/xpath-functions/#func-numeric-mod)`
    and `[IDIV](https://www.w3.org/TR/xpath-functions/#func-numeric-integer-divide)` for modulus and integer division.
- [LET variable assignment](assignment.html)
- [Order results using a Collation](collation.html)
- [Construct Quad](construct-quad.html)
- [Generate JSON from SPARQL](generate-json-from-sparql.html)

## Update

ARQ supports the W3C standard SPARQL Update language.

- [SPARQL Update](http://www.w3.org/TR/sparql11-update/)
- [The ARQ SPARQL/Update API](update.html)

## See Also

- [Fuseki](../fuseki2/index.html) - Server implementation of the SPARQL protocol.
- [TDB - A SPARQL database for Jena](../tdb), a pure Java persistence layer for large graphs, high performance applications and embedded use.
- [RDFConnection](../rdfconnection), a unified API for SPARQL Query, Update and Graph Store Protocol.

## W3C Documents

- [SPARQL Query Language specification](http://www.w3.org/TR/sparql11-query/)
- [SPARQL Query Results JSON Format](https://www.w3.org/TR/sparql11-results-json/)
- [SPARQL Protocol](http://www.w3.org/TR/rdf-sparql-protocol/)

## Articles

Articles and documentation elsewhere:

- [Introducing SPARQL: Querying the Semantic Web](http://xml.com/lpt/a/2005/11/16/introducing-sparql-querying-semantic-web-tutorial.html)
    ([xml.com](http://www.xml.com/) article by Leigh Dodds)
- [Search RDF data with SPARQL](http://www.ibm.com/developerworks/xml/library/j-sparql/)
    (by Phil McCarthy) - article published on IBM developer works about
    SPARQL and Jena.
- [SPARQL reference card](http://www.dajobe.org/2005/04-sparql/)
    (by [Dave Beckett](http://www.dajobe.org/))
- [Parameterised Queries with SPARQL and ARQ](http://www.ldodds.com/blog/archives/000251.html)
    (by Leigh Dodds)
- [Writing an ARQ Extension Function](http://www.ldodds.com/blog/archives/000252.html)
    (by Leigh Dodds)

## RDF Syntax Specifications

- [Turtle](https://www.w3.org/TR/turtle/)
- [N-Triples](https://www.w3.org/TR/n-triples)
- [TriG](https://www.w3.org/TR/trig/)
- [N-Quads](https://www.w3.org/TR/n-quads/)
