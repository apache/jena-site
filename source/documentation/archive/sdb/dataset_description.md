---
title: SDB Dataset Description
---

----
> The Apache Jena SDB module has been retired and is no longer supported.<br/>
> The last release of Jena with this module was Apache Jena 3.17.0.<br/>
----

Assembler descriptions for RDF Datasets and individual models are
built from
[Store Descriptions](store_description.html "SDB/Store Description").
A dataset assembler just points to the store to use; a model
assembler points to the store and identifies the model within the
store to use (or use the default model).

## Datasets

The example below creates an in-memory store implemented by
HSQLDB.

    PREFIX rdfs:   <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX rdf:    <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX xsd:    <http://www.w3.org/2001/XMLSchema#>

    PREFIX ja:     <http://jena.hpl.hp.com/2005/11/Assembler#>
    PREFIX sdb:    <http://jena.hpl.hp.com/2007/sdb#>

    sdb:DatasetStore rdfs:subClassOf ja:RDFDataset .

    <#dataset> rdf:type sdb:DatasetStore ;
        sdb:store <#store> .

    <#store> rdf:type sdb:Store ;
       ...
       .

A dataset description for SDB is identical to a store description,
except the `rdf:type` is `sdb:DatasetStore`. A different kind of
Java object is created.

## Models

To assemble a particular model in a store, especially to work with
at the API level rather than at the query level, the following can
be added to an assembler description:

    # Default graph
    <#myModel1> rdf:type sdb:Model ;
        sdb:dataset <#dataset> .

    # Named graph
    <#myModel2> rdf:type sdb:Model ;
        sdb:namedGraph   data:graph1 ;
        sdb:dataset <#dataset> .

There can several model descriptions in the same file, referring to
the same SDB dataset, or to different ones. The Jena assembler
interface enables different items to be picked out.

Note that creating a general (ARQ) dataset from models/graph inside
an SDB store is not the same as using a dataset which is the query
interface to the store. It is the dataset for the store that
triggers full SPARQL to SQL translation, not a model.



