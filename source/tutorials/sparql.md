---
title: SPARQL Tutorial
---

The objective of this SPARQL tutorial is to give a fast course in
SPARQL. The tutorial covers the major features of the query
language through examples but does not aim to be complete.

If you are looking for a short introduction to SPARQL and Jena try
[Search RDF data with SPARQL](https://www.ibm.com/developerworks/xml/library/j-sparql/).  If you are looking to execute SPARQL queries in code and already known SPARQL then you likely want to read the [ARQ Documentation][1] instead.

[1]: /documentation/query/index.html

SPARQL is a
[query language](https://www.w3.org/TR/sparql11-query/) and a
[protocol](https://www.w3.org/TR/rdf-sparql-protocol/) for accessing
RDF designed by the
[W3C RDF Data Access Working Group](https://www.w3.org/2001/sw/DataAccess/). 

As a query language, SPARQL is "data-oriented" in that it only
queries the information held in the models; there is no inference
in the query language itself.  Of course, the Jena model may be
'smart' in that it provides the impression that certain triples
exist by creating them on-demand, including OWL reasoning.  SPARQL
does not do anything other than take the description of what the
application wants, in the form of a query, and returns that
information, in the form of a set of bindings or an RDF graph.

## SPARQL tutorial

1.  [Preliminaries: data!](sparql_data.html)
2.  [Executing a simple query](sparql_query1.html)
3.  [Basic patterns](sparql_basic_patterns.html)
4.  [Value constraints](sparql_filters.html)
5.  [Optional information](sparql_optionals.html)
6.  [Alternatives](sparql_union.html)
7.  [Named Graphs](sparql_datasets.html)
8.  [Results](sparql_results.html)

## Other Material

-   The
    [SPARQL query language definition document](https://www.w3.org/TR/sparql11-query/)
    itself contains many examples.
-   [Search RDF data with SPARQL](https://developer.ibm.com/articles/j-sparql/)
    (by Phil McCarthy) - article published on IBM developer works about
    SPARQL and Jena.
-   [SPARQL reference card](https://www.dajobe.org/2005/04-sparql/)
    (by [Dave Beckett](https://www.dajobe.org/))

Detailed [ARQ documentation](/documentation/query/)
