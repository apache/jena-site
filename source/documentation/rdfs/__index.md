---
title: Data with RDFS Inferencing
slug: index
---

This page describes support for accessing data with additional statements
derived using RDFS. It supports `rdfs:subClassOf`, `rdfs:subPropertyOf`, `rdfs:domain` and `rdfs:range`. It
does not provide RDF axioms. The RDFS vocabulary is not included in the data.

It does support use with RDF datasets, where each graph in the dataset has the
same RDFS vocabulary applied to it.

This is not a replacement for the [Jena RDFS Reasoner support](/inference/)
which covers full RDFS inference.

The data is updateable, and graphs can be added and removed from the dataset.
The vocabulary can not be changed during the lifetime of the RDFS dataset.

### API: `RDFSFactory`

The API provides operation to build RDF-enabled datasets from data storage and vocabularies:
    
Example:
```
    DatasetGraph data = ...
    // Load the vocabulary
    Graph vocab = RDFDataMgr.loadGraph("vocabulary.ttl");
    // Create a DatasetGraph with RDFS
    DatasetGraph dsg = datasetRDFS(DatasetGraph data, Graph vocab );
    // (Optional) Present as a Dataset.
    Dataset dataset = DatasetFactory.wrap(dsg);
```

The vocabulary is processed to produce datastructure needed for processing the
data eficiently at run time. This is the `SetupRDFS` class that can be created
and shared; it is thread-safe.

```
    SetupRDFS setup = setupRDFS(vocab);
```

### Assembler: RDFS Dataset

Datasets with RDFS can be built with an assembler:

```
<#rdfsDS> rdf:type ja:DatasetRDFS ;
      ja:rdfsSchema <vocabulary.ttl>;
      ja:dataset <#baseDataset> ;
      .

<#baseDataset> rdf:type ...some dataset type ... ;
      ...
      .
```
where `<#baseDataset>` is the definition of the dataset to be enriched.

### Assembler: RDFS Graph

It is possible to build a single `Model`:

```
  <#rdfsGraph> rdf:type ja:GraphRDFS ;
      ja:rdfsSchema <vocabulary.ttl>;
      ja:graph <#baseGraph> ;
      .

  <#baseGraph> rdf:type ja:MemoryModel;
      ...
```

More generally, inference models can be defined using the Jena Inference and Rule
engine:
[jena-fuseki2/examples/config-inference-1.ttl](https://github.com/apache/jena/tree/main/jena-fuseki2/examples/config-inference-1.ttl).

## Use with Fuseki

The files for this example are available at:
[jena-fuseki2/examples/rdfs](https://github.com/apache/jena/tree/main/jena-fuseki2/examples/rdfs).

From the command line (here, loading data from a file into an in-memory dataset):
```
fuseki-server --data data.trig --rdfs vocabulary.ttl /dataset
```

or from a configuration file with an RDFS Dataset:

```
PREFIX :        <#>
PREFIX fuseki:  <http://jena.apache.org/fuseki#>
PREFIX rdf:     <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs:    <http://www.w3.org/2000/01/rdf-schema#>
PREFIX ja:      <http://jena.hpl.hp.com/2005/11/Assembler#>

[] rdf:type fuseki:Server ;
   fuseki:services (
     :service
   ) .

## Fuseki service /dataset with SPARQ query
## /dataset?query=
:service rdf:type fuseki:Service ;
    fuseki:name "dataset" ;
    fuseki:endpoint [ fuseki:operation fuseki:query ] ;
    fuseki:endpoint [ fuseki:operation fuseki:update ] ;
    fuseki:dataset :rdfsDataset ;
    .

## RDFS
:rdfsDataset rdf:type ja:DatasetRDFS ;
    ja:rdfsSchema <file:vocabulary.ttl>;
    ja:dataset :baseDataset;
    .

## Transactional in-memory dataset.
:baseDataset rdf:type ja:MemoryDataset ;
    ja:data <file:data.trig>;
    .
```

### Querying the Fuseki server

With the [SOH](/documentation/fuseki2/soh.html) tools, a query (asking for plain
text output):
```
s-query --service http://localhost:3030/dataset --output=text --file query.rq 
```

or with `curl`:

```
curl --data @query.rq \
      --header 'Accept: text/plain' \
      --header 'Content-type: application/sparql-query' \
      http://localhost:3030/dataset
```

will return:

```
-------------------------
| s  | p        | o     |
=========================
| :s | ns:p     | :o    |
| :s | rdf:type | ns:D  |
| :o | rdf:type | ns:T1 |
| :o | rdf:type | ns:T3 |
| :o | rdf:type | ns:T2 |
-------------------------
```

### Files

data.trig:
```
PREFIX :        <http://example/>
PREFIX ns:      <http://example/ns#>

:s ns:p :o .
```

`vocabulary.ttl`:

```
PREFIX xsd:     <http://www.w3.org/2001/XMLSchema#>
PREFIX rdf:     <http://www.w3.org/1999/02/22-rdf-syntax-ns#> 
PREFIX rdfs:    <http://www.w3.org/2000/01/rdf-schema#>
PREFIX skos:    <http://www.w3.org/2008/05/skos#>
PREFIX list:    <http://jena.hpl.hp.com/ARQ/list#>

PREFIX ns: <http://example/ns#>

ns:T1 rdfs:subClassOf ns:T2 .
ns:T2 rdfs:subClassOf ns:T3 .

ns:p rdfs:domain ns:D .
ns:p rdfs:range  ns:T1 .
```

`query.rq`:
```
PREFIX :      <http://example/>
PREFIX ns:    <http://example/ns#>
PREFIX rdf:   <http://www.w3.org/1999/02/22-rdf-syntax-ns#>

SELECT * { ?s ?p ?o }
```
