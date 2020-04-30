---
title: In-memory, transactional Dataset
---

The in-memory, transactional dataset provides a dataset with full ACID
transaction semantics, including abort. It provides for multiple
readers and a concurrent writer together with full snapshot isolation of
the dataset.  Readers see an unchanging, consistent dataset where aggregate
operations return stable results.

First introduced in Jena version 3.0.1 as a beta, then in 3.1.0.

During the beta phase, please log any issues with [Apache Jena JIRA](https://issues.apache.org/jira/issues/?jql=project%20%3D%20JENA%20ORDER%20BY%20key%20DESC%2C%20priority%20DESC).

### API use

A new instance of the class is obtained by a call to `DatasetFactory.createTxnMem()`:

    Dataset ds = DatasetFactory.createTxnMem() ;

This can then be used by the application for reading:

    Dataset ds = DatasetFactory.createTxnMem() ;
    ds.begin(ReadWrite.READ) ;
    try {
       ... SPARQL query ...
    } finally { ds.end() ; }

or writing:

    Dataset ds = DatasetFactory.createTxnMem() ;
    ds.begin(ReadWrite.WRITE) ;
    try {
       ... SPARQL update ...
       ... SPARQL query ...
       ... SPARQL update ...
       ds.commit() ;
    } finally { ds.end() ; }

If the application does not call `commit()`, the transaction aborts and the
changes are lost. The same happens if the application throws an exception.

### Non-transactional use.

If used outside of a transaction, the implementation provides "auto-commit"
functionality. Each triple or added or deleted is done inside an implicit
transaction. This has a measurable performance impact. It is better to do
related operations inside a single transaction explicitly in the
application code.

### Assembler Use

The assembler provides for the creation of a dataset and also loading it
with data read from URLs (files or from any other URL).

-    Type: `ja:MemoryDataset`
-    Properties:
     - `ja:data` <i>`urlForData`</i>
     - `ja:namedGraph`, for loading a specific graph of the dataset.
        This uses `ja:graphName` to specific the name and `ja:data` to load data.

The examples use the following prefixes:

    @prefix ja:     <http://jena.hpl.hp.com/2005/11/Assembler#> .
    @prefix rdf:    <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .

To create an empty in-memory dataset, all that is required is the line:

    [] rdf:type ja:MemoryDataset .

With triples for the default graph, from file `dataFile.ttl`, Turtle format:

    [] rdf:type ja:MemoryDataset ;
        ja:data <file:dataFile.ttl> .

With triples from several files:

    [] rdf:type ja:MemoryDataset ;
        ja:data <file:data1.ttl> ;
        ja:data <file:data2.nt> ;
        ja:data <file:data3.jsonld> ;
        .

Load TriG:

    [] rdf:type ja:MemoryDataset ;
        ja:data <file:data.trig> .

Load a file of triples into a named graph:

    [] rdf:type ja:MemoryDataset ;
        ja:namedGraph [ ja:graphName <http://example/graph> ; ja:data <file:///fullPath/data.ttl> ] .
