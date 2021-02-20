---
title: CSV PropertyTable
---

----
> This page covers the jena-csv module which has been retired.
> The last release of Jena with this module is Jena 3.9.0.
> See [jena-csv/README.md](https://github.com/apache/jena/tree/main/jena-csv).
> This is the original documentation.
----

This module is about getting CSVs into a form that is amenable to Jena SPARQL processing, and doing so in a way that is not specific to CSV files. 
It includes getting the right architecture in place for regular table shaped data, using the core abstraction of PropertyTable.

*Illustration*

This module involves the basic mapping of CSV to RDF using a fixed algorithm, including interpreting data as numbers or strings.

Suppose we have a CSV file located in “file:///c:/town.csv”, which has one header row, two data rows:

    Town,Population
    Southton,123000
    Northville,654000
 
As RDF this might be viewable as:
 
    @prefix : <file:///c:/town.csv#> .
    @prefix csv: <http://w3c/future-csv-vocab/> .
    [ csv:row 1 ; :Town "Southton" ; :Population  “123000”^^http://www.w3.org/2001/XMLSchema#int ] .
    [ csv:row 2 ; :Town "Northville" ; :Population  “654000”^^http://www.w3.org/2001/XMLSchema#int  ] .
 
or without the bnode abbreviation:
 
    @prefix : <file:///c:/town.csv#> .
    @prefix csv: <http://w3c/future-csv-vocab/> .
    _:b0  csv:row 1 ;
          :Town "Southton" ;
          :Population “123000”^^http://www.w3.org/2001/XMLSchema#int .
    _:b1  csv:row 2 ;
          :Town "Northville" ;
          :Population “654000”^^http://www.w3.org/2001/XMLSchema#int.
          
Each row is modeling one "entity" (here, a population observation). 
There is a subject (a blank node) and one predicate-value for each cell of the row. 
Row numbers are added because it can be important. 
Now the CSV file is viewed as a graph - normal, unmodified SPARQL can be used. 
Multiple CSVs files can be multiple graphs in one dataset to give query across different data sources.
 
We can use the following SPARQL query for “Towns over 500,000 people” mentioned in the CSV file:
 
    SELECT ?townName ?pop {
      GRAPH <file:///c:/town.csv> {
        ?x :Town ?townName ;
           :Popuation ?pop .
        FILTER(?pop > 500000)
      }
    }

What's more, we make some room for future extension through `PropertyTable`.
The [architecture](design.html) is designed to be able to accommodate any table-like data sources, such as relational databases, Microsoft Excel, etc.

## Documentation

-   [Get Started](get_started.html)
-   [Design](design.html)
-   [Implementation](implementation.html)



