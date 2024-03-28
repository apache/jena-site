---
title: TDB Dynamic Datasets
---

*TDB version 0.8.5 and later*

This feature allows a query to be made on a subset of all the named
graphs in the TDB storage datasets. The SPARQL `GRAPH` pattern
allows access to either a specific named graph or to all the named
graph in a dataset. This feature means that only specified named
graphs are visible to the query.

SPARQL has the concept of a
[dataset description](http://www.w3.org/TR/sparql11-query/#specifyingDataset).
In a query string, the clauses for FROM and FROM NAMED specify the
dataset. The FROM clauses define the graphs that are merged to form
the default graph, and the FROM NAMED clauses identify the graphs
to be included as named graphs.

Normally, ARQ interprets these as coming from the web; the
graphs are read using HTTP GET. TDB modifies this behaviour; instead
of the universe of graphs being the web, the universe of graphs is
the TDB data store. FROM and FROM NAMED describe a dataset with
graphs drawn only from the TDB data store.

-   Using one or more FROM clauses, causes the default graph of the 
    dataset to be the union of those graphs.
-   Using one or more FROM NAMED, with no FROM in a query,
    causes an empty graph to be used for the default graph.
-   Using one or more FROM NAMED, with no FROM in a query, where the symbol
    [`TDB.symUnionDefaultGraph`](configuration.html)
    is also set, causes the default graph to be the set union of all the named
    graphs (FROM NAMED).

Example

    #Follow a foaf:knows path across both Alice and Bobs FOAF data
    #where the data is  in the datastore as named graphs.

    BASE <http://example>
    SELECT ?zName
    FROM <alice-foaf>
    FROM <bob-foaf>
    {
       <http://example/Alice#me> foaf:knows ?y .
       ?y foaf:knows ?z .
       ?z foaf:name ?zName .
    }
