---
title: TDB
slug: index
---

TDB is a component of [Jena](https://jena.apache.org/) for RDF storage and
query.  It supports the full range of Jena APIs.  TDB can be used as a high
performance RDF store on a single machine.  This documentation describes the
latest version, unless otherwise noted.

This is the documentation for the current standard version of TDB. 
This is also called TDB1 to distinguish it from the next generation version
[TDB2](../tdb2/)

*TDB1 and TDB2 databases are not compatible.*

A TDB store can be accessed and managed with the provided command
line scripts and via the Jena API.  When accessed using [transactions](tdb_transactions.html)
a TDB dataset is protected against corruption, unexpected process terminations and system crashes.

A TDB dataset **should** only be directly accessed from a single JVM at a time otherwise data corruption
may occur.  From 1.1.0 onwards TDB includes automatic protection against multi-JVM usage which prevents this
under most circumstances. 

If you wish to share a TDB dataset between multiple applications please use our
[Fuseki](../fuseki2/) component which provides a SPARQL server that
can use TDB for persistent storage and provides the SPARQL protocols
for query, update and REST update over HTTP.  

## Documentation

-   [Using TDB from Java through the API](java_api.html)
-   [Command line utilities](commands.html)
-   [Transactions](tdb_transactions.html)
-   [Assemblers for Graphs and Datasets](assembler.html)
-   [Datasets and Named Graphs](datasets.html)
-   [Dynamic Datasets](dynamic_datasets.html):  Query a subset of the named graphs
-   [Quad filtering](quadfilter.html): Hide information in the dataset
-   [The TDB Optimizer](optimizer.html)
-   [TDB Configuration](configuration.html)
-   [Value Canonicalization](value_canonicalization.html)
-   [TDB Design](architecture.html)
-   [Use on 64 bit or 32 bit Java systems](tdb_system.html)
-   [FAQs](faqs.html)
