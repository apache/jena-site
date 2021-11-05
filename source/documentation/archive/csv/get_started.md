---
title: CSV PropertyTable - Get Started
---

## Using CSV PropertyTable with Apache Maven

See ["Using Jena with Apache Maven"](/download/maven.html) for full details.

    <dependency>
       <groupId>org.apache.jena</groupId>
       <artifactId>jena-csv</artifactId>
       <version>X.Y.Z</version>
    </dependency>

## Using CSV PropertyTable from Java through the API

In order to switch on CSV PropertyTable, it's required to register `LangCSV` into [Jena RIOT](/documentation/io/), through a simple method call:

	import org.apache.jena.propertytable.lang.CSV2RDF;
	... 
        CSV2RDF.init() ;

It's a static method call of registration, which needs to be run just one time for an application before using CSV PropertyTable (e.g. during the initialization phase).

Once registered, CSV PropertyTable provides 2 ways for the users to play with (i.e. GraphCSV and RIOT):

### GraphCSV

[GraphCSV](https://github.com/apache/jena/tree/main/jena-csv/src/main/java/org/apache/jena/propertytable/graph/GraphCSV.java) wrappers a CSV file as a Graph, which makes a Model for SPARQL query:

    Model model = ModelFactory.createModelForGraph(new GraphCSV("data.csv")) ;
    QueryExecution qExec = QueryExecutionFactory.create(query, model) ;

or for multiple CSV files and/or other RDF data:
    
    Model csv1 = ModelFactory.createModelForGraph(new GraphCSV("data1.csv")) ;
    Model csv2 = ModelFactory.createModelForGraph(new GraphCSV("data2.csv")) ;
    Model other = ModelFactory.createModelForGraph(otherGraph) ;
    Dataset dataset = ... ;
    dataset.addNamedModel("http://example/table1", csv1) ;
    dataset.addNamedModel("http://example/table2", csv2) ;
    dataset.addNamedModel("http://example/other", other) ;
    ... normal SPARQL execution ...

You can also find the full examples from [GraphCSVTest](https://github.com/apache/jena/tree/main/jena-csv/src/test/java/org/apache/jena/propertytable/graph/GraphCSVTest.java).

In short, for Jena ARQ, a CSV table is actually a Graph (i.e. GraphCSV), without any differences from other types of Graphs when using it from the Jena ARQ API.

### RIOT

When LangCSV is registered into RIOT, CSV PropertyTable adds a new RDF syntax of '.csv' with the content type of "text/csv".
You can read ".csv" files into Model following the standard RIOT usages:

    // Usage 1: Direct reading through Model
    Model model_1 = ModelFactory.createDefaultModel()
    model.read("test.csv") ;
    
    // Usage 2: Reading using RDFDataMgr
    Model model_2 = RDFDataMgr.loadModel("test.csv") ;

For more information, see [Reading RDF in Apache Jena](/documentation/io/rdf-input.html).

Note that, the requirements for the CSV files are listed in the documentation of [Design](design.html). CSV PropertyTable only supports **single-Value**, **regular-Shaped**, **table-headed** and **UTF-8-encoded** CSV files (**NOT** Microsoft Excel files).

## Command Line Tool

[csv2rdf](https://github.com/apache/jena/tree/main/jena-csv/src/main/java/riotcmd/csv2rdf.java) is a tool for direct transforming from CSV to the formatted RDF syntax of N-Triples.
The script calls the `csv2rdf` java program in the `riotcmd` package in this way:

    java -cp ... riotcmdx.csv2rdf inputFile ...

It transforms the CSV `inputFile` into N-Triples. For example,

    java -cp ... riotcmdx.csv2rdf src/test/resources/test.csv

The script reuses [Common framework for running RIOT parsers](../io/index.html),
so that it also accepts the same arguments
(type `"riot --help"` to get command line reminders) from 
[RIOT Command line tools](/documentation/io/#command-line-tools):

-   `--validate`: Checking mode: same as `--strict --sink --check=true`
-   `--check=true/false`: Run with checking of literals and IRIs either on or off.
-   `--sink`: No output of triples or quads in the standard output (i.e. `System.out`).
-   `--time`: Output timing information.


