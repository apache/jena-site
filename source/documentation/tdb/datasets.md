---
title: TDB Datasets
---

An
[RDF Dataset](http://www.w3.org/TR/sparql11-query/#rdfDataset "http://www.w3.org/TR/rdf-sparql-query/#rdfDataset")
is a collection of one, unnamed, default graph and zero, or more
named graphs. In a SPARQL query, a query pattern is matched against
the default graph unless the GRAPH keyword is applied to a
pattern.

## Dataset Storage

One file location (directory) is used to store one RDF dataset. The
unnamed graph of the dataset is held as a single graph while all
the named graphs are held in a collection of quad indexes.

Every dataset is obtained via TDBFactory.createDataset(Location)
within a JVM is the same dataset. (If a model is obtained from via
TDBFactory.createModel(Location) there is a hidden, shared dataset
and the appropriate model is returned. The preferred style 
is to create the dataset, then get a model.)

## Dataset Query

There is full support for SPARQL query over named graphs in a
TDB-back dataset.

All the named graphs can be treated as a single graph which is the
union (RDF merge) of all the named graphs. This is given the
special graph name <urn:x-arq:UnionGraph\> in a GRAPH pattern.

When querying the RDF merge of named graphs, the default graph in
the store is not included. This feature applies to queries only. It
does not affect the storage nor does it change loading.

Alternatively, if the symbol tdb:unionDefaultGraph (see
[TDB Configuration](configuration.html)) is
set, the unnamed graph for the query is the union of all the named
graphs in the datasets. The stored default graph is ignored and is
not part of the data of the union graph although it is
accessible by the special name `<urn:x-arq:DefaultGraph\>` in a GRAPH
pattern.

Set globally:

    TDB.getContext().set(TDB.symUnionDefaultGraph, true) ;

or set on a per query basis:

    try(QueryExecution qExec = QueryExecution.dataset(dataset)
            .query(query)
            .set(TDB.symUnionDefaultGraph,true)
            .build() ) {
         ....
    }

## Special Graph Names

URI | Meaning
--- | -------
`urn:x-arq:UnionGraph`  | The RDF merge of all the named graphs in the datasets of the query.
`urn:x-arq:DefaultGraph` | The default graph of the dataset, used when the default graph of the query is the union graph.

Note that setting tdb:unionDefaultGraph does not affect the default
graph or default model obtained with dataset.getDefaultModel().

The RDF merge of all named graph can be accessed as the named graph
`urn:x-arq:UnionGraph` using
`Dataset.getNamedModel("urn:x-arq:UnionGraph")` .

## Dataset Inferencing

Inferencing on a Model in a Dataset, using the [TDB Java API](java_api.html), follows the same pattern as an in-memory InfModel.
The use of [TDB Transactions](tdb_transactions.html) is **strongly** recommended to avoid data corruption.

      //Open TDB Dataset
      String directory = ...
      Dataset dataset = TDBFactory.createDataset(directory);

      //Retrieve Named Graph from Dataset, or use Default Graph.
      String graphURI = "http://example.org/myGraph";
      Model model = dataset.getNamedModel(graphURI);

      //Create RDFS Inference Model, or use other Reasoner e.g. OWL.
      InfModel infModel = ModelFactory.createRDFSModel(model);

      ...
      //Perform operations on infModel.
      ...
