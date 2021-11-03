---
title: TDB Assembler
---

[Assemblers](/documentation/assembler/)
are a general mechanism in Jena to describe objects to be built,
often these objects are models and datasets. Assemblers are used
heavily in [Fuseki](../fuseki2/) for
dataset and model descriptions, for example.

SPARQL queries operate over an
[RDF dataset](http://www.w3.org/TR/sparql11-query/#rdfDataset "http://www.w3.org/TR/rdf-sparql-query/#rdfDataset"),
which is an unnamed, default graph and zero or more named graphs.

Having the description in a file means that the data that the
application is going to work on can be changed without changing the
program code.

## Contents

-   [Dataset](#dataset)
    -   [Union Default Graph](#union-default-graph)
-   [Graph](#graph)
-   [Mixed Datasets](#mixed-datasets)
-   [RDFS](#rdfs)

## Dataset

This is needed for use in [Fuseki](../fuseki2/ "Fuseki").

A dataset can be constructed in an assembler file:

    PREFIX tdb:     <http://jena.hpl.hp.com/2008/tdb#>
    PREFIX rdf:     <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX rdfs:    <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX ja:      <http://jena.hpl.hp.com/2005/11/Assembler#>

    <#dataset> rdf:type         tdb:DatasetTDB ;
        tdb:location "DB" ;
        .

Only one dataset can be stored in a location (filing system
directory).

The first section declares the prefixes used later:

    PREFIX tdb:     <http://jena.hpl.hp.com/2008/tdb#>
    PREFIX rdf:     <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX rdfs:    <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX ja:      <http://jena.hpl.hp.com/2005/11/Assembler#>

then there is the description of the TDB dataset itself:

    <#dataset> rdf:type tdb:DatasetTDB ;
        tdb:location "DB" ;

The property `tdb:location` gives the file name as a string. It is
relative to the applications current working directory, not where
the assembler file is read from.

The dataset description is usually found by looking for the one
subject with type `tdb:GraphDataset`. If more than one graph is
given in a single file, the application will have to specify which
description it wishes to use.

### Union Default Graph

An assembler can specify that the default graph for query is the
union of the named graphs. This is done by adding
*tdb:unionDefaultGraph*.

    <#dataset> rdf:type         tdb:DatasetTDB ;
        tdb:location "DB" ;
        tdb:unionDefaultGraph true ;
        .

## Graph

TDB always stores data in an RDF dataset.  It is possible to use
just one of the graphs from the dataset.  A common way of working
with one graph is to use the default graph of the dataset.

A single graph from a TDB dataset can be described by:

    PREFIX tdb:     <http://jena.hpl.hp.com/2008/tdb#>
    PREFIX rdf:     <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX rdfs:    <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX ja:      <http://jena.hpl.hp.com/2005/11/Assembler#>

    <#dataset> rdf:type tdb:DatasetTDB ;
        tdb:location "DB" ;

    <#graph> rdf:type tdb:GraphTDB ;
        tdb:dataset <#dataset> .

A particular named graph in the dataset at a location can be
assembled with:

    <#graphNamed> rdf:type tdb:GraphTDB ;
        tdb:dataset <#dataset> ;
        tdb:graphName <http://example/graph1> ;
        .

## Mixed Datasets

It is possible to create a dataset with graphs backed by different
storage subsystems, although query is not necessarily as
efficient.

To include as a named graph in a dataset use vocabulary as shown
below:

    PREFIX tdb:     <http://jena.hpl.hp.com/2008/tdb#>
    PREFIX rdf:     <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX rdfs:    <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX ja:      <http://jena.hpl.hp.com/2005/11/Assembler#>

    # A dataset of one TDB-backed graph as the default graph and 
    # an in-memory graph as a named graph.
    <#dataset> rdf:type      ja:RDFDataset ;
         ja:defaultGraph <#graph> ;
         ja:namedGraph
            [ ja:graphName      <http://example.org/name1> ;
              ja:graph          <#graph2> ] ;
         .

    <#graph> rdf:type tdb:GraphTDB ;
        tdb:location "DB" ;
        .

    <#graph2> rdf:type ja:MemoryModel ;
         ja:content [ja:externalContent <file:Data/books.n3> ] ;
         .

Note here we added:

    tdb:DatasetTDB  rdfs:subClassOf  ja:RDFDataset .
    tdb:GraphTDB    rdfs:subClassOf  ja:Model .

which provides for integration with complex model setups, such as
reasoners.

## RDFS

    PREFIX tdb:     <http://jena.hpl.hp.com/2008/tdb#>
    PREFIX rdf:     <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX rdfs:    <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX ja:      <http://jena.hpl.hp.com/2005/11/Assembler#>

    tdb:Dataset a rdfs:Class .
    tdb:GraphTDB a rdfs:Class .

    tdb:DatasetTDB  rdfs:subClassOf  ja:RDFDataset .
    tdb:GraphTDB    rdfs:subClassOf  ja:Model .

    tdb:location a rdf:Property ;
       # domain is tdb:Dataset or tdb:GraphTDB
       # The range is simple literal
       .

    tdb:unionDefaultGraph a rdf:Property ;
       rdfs:domain tdb:Dataset ;
       # The range is xsd:boolean
       .

    tdb:graphName a rdf:Property ;
       rdfs:domain tdb:GraphTDB ;
       # range is a URI
       .
