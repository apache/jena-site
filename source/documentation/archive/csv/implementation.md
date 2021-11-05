---
title: CSV PropertyTable - Implementation
---

## PropertyTable Implementations

There are 2 implementations for `PropertyTable`. The pros and cons are summarised in the following table: 

PropertyTable Implementation | Description | Supported Indexes | Advantages | Disadvantages  
---------------------------- | ----------- | ----------------- | ---------- | ------------- 
`PropertyTableArrayImpl` | implemented by a two-dimensioned Java array of `Nodes`| SPO, PSO | compact memory usage, fast for querying with S and P, fast for query a whole `Row` | slow for query with O, table Row/Column size provided |
`PropertyTableHashMapImpl` | implemented by several Java `HashMaps` | PSO, POS | fast for querying with O, table Row/Column size not required | more memory usage for HashMaps |

By default, [PropertyTableArrayImpl]((https://github.com/apache/jena/tree/main/jena-csv/src/main/java/org/apache/jena/propertytable/impl/PropertyTableArrayImpl.java) is used as the `PropertyTable` implementation held by `GraphCSV`.
If you want to switch to [PropertyTableHashMapImpl](https://github.com/apache/jena/tree/main/jena-csv/src/main/java/org/apache/jena/propertytable/impl/PropertyTableHashMapImpl.java), just use the static method of `GraphCSV.createHashMapImpl()` to replace the default `new GraphCSV()` way.
Here is an example:

    Model model_csv_array_impl = ModelFactory.createModelForGraph(new GraphCSV(file)); // PropertyTableArrayImpl
    Model model_csv_hashmap_impl = ModelFactory.createModelForGraph(GraphCSV.createHashMapImpl(file)); // PropertyTableHashMapImpl

## StageGenerator Optimization for GraphPropertyTable

Accessing from SPARQL via `Graph.find()` will work, but it's not ideal. Some optimizations can be done for processing a SPARQL basic graph pattern. More explicitly, in the method of `OpExecutor.execute(OpBGP, ...)`, when the target for the query is a `GraphPropertyTable`, it can get a whole `Row`, or `Rows`, of the table data and match the pattern with the bindings.

The optimization of querying a whole `Row` in the PropertyTable are supported now.
The following query pattern can be transformed into a `Row` querying, without generating triples:

    ?x :prop1 ?v .
    ?x :prop2 ?w .
    ...

It's made by using the extension point of `StageGenerator`, because it's now just concerned with `BasicPattern`.
The detailed workflow goes in this way:

1.    Split the incoming `BasicPattern` by subjects, (i.e. it becomes multiple sub BasicPatterns grouped by the same subjects. (see [QueryIterPropertyTable](https://github.com/apache/jena/tree/main/jena-csv/src/main/java/org/apache/jena/propertytable/impl/QueryIterPropertyTable.java) )
2.    For each sub `BasicPattern`, if the `Triple` size within is greater than 1 (i.e. at least 2 `Triples`), it's turned into a `Row` querying, and processed by [QueryIterPropertyTableRow](https://github.com/apache/jena/tree/main/jena-csv/src/main/java/org/apache/jena/propertytable/impl/QueryIterPropertyTableRow.java), else if it contains only 1 `Triple`, it goes for the traditional `Triple` querying by `graph.graphBaseFind()`

In order to turn on this optimization, we need to register the [StageGeneratorPropertyTable](https://github.com/apache/jena/tree/main/jena-csv/src/main/java/org/apache/jena/propertytable/impl/StageGeneratorPropertyTable.java) into ARQ context, before performing SPARQL querying:

    StageGenerator orig = (StageGenerator)ARQ.getContext().get(ARQ.stageGenerator) ;
    StageGenerator stageGenerator = new StageGeneratorPropertyTable(orig) ;
    StageBuilder.setGenerator(ARQ.getContext(), stageGenerator) ;

