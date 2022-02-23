---
title: TDB Transactions
---

TDB provides
[ACID](http://en.wikipedia.org/wiki/ACID)
transaction support through the use of
[write-ahead-logging](http://en.wikipedia.org/wiki/Write-ahead_logging) in TDB1
and copy-on-write MVCC structures in TDB2.

Use of transactions protects a TDB dataset against data corruption, unexpected
process termination and system crashes. 

Non-transactional use of TDB1 should be avoided; TDB2 only operates with transactions.

## Contents

-   [Overview](#overview)
-   [Limitations](#limitations)
-   [API for Transactions](#api-for-transactions)
    - [Read transactions](#read-transactions)
    - [Write transactions](#write-transactions)
-   [Multi-threaded use](#multi-threaded-use)
-   [Bulk loading](#bulk-loading)
-   [Multi JVM](#multi-jvm)

## Overview

TDB2 uses [MVCC](https://en.wikipedia.org/wiki/Multiversion_concurrency_control)
via a copy-on-write mechanism. Update transactions can be of any size.

The TDB1 transaction mechanism is based on
[write-ahead-logging](http://en.wikipedia.org/wiki/Write-ahead_logging).  All
changes made inside a write-transaction are written to
[journals](http://en.wikipedia.org/wiki/Journaling_file_system), then propagated
to the main database at a suitable moment.  Transactions in TDB1 are limited in
size to a few 10's of million triples because they retain data in-memory until
indexes can be updated.

Transactional TDB supports one active write transaction, and
multiple read transactions at the same time. Read-transactions
started before a write-transaction commits see the database in a
state without any changes visible. Any transaction starting after a
write-transaction commits sees the database with the changes
visible, whether fully propagates back to the database or not.
There can be active read transactions seeing the state of the
database before the updates, and read transactions seeing the state
of the database after the updates running at the same time.

Transactional TDB works with SPARQL Query, SPARQL Update, SPARQL
Graph Store Update as well as the full Jena API.

TDB provides
[Serializable](http://en.wikipedia.org/wiki/Isolation_(database_systems)#SERIALIZABLE)
transactions, the highest
[isolation level](http://en.wikipedia.org/wiki/Isolation_(database_systems)).

## Limitations

(some of these limitations may be removed in later versions)

-   Bulk loads: the TDB bulk loader is not transactional
-   [Nested transactions](http://en.wikipedia.org/wiki/Nested_transaction) 
    are not supported.

TDB2 removed the limitations of TDB1:

-   Some active transaction state is held exclusively in-memory,
    limiting scalability.
-   Long-running transactions. Read-transactions cause a build-up
    of pending changes;

If a single read transaction runs for a long time when there are
many updates, the TDB1 system will consume a lot of temporary
resources.

## API for Transactions

Ths section uses the primitives of the transaction mechanism. 

Better APIs are described in [the transaction API
documentation](/documentation/txn/).

### Read transactions

These are used for SPARQL queries and code using the Jena API
actions that do not change the data.  The general pattern is:

     dataset.begin(ReadWrite.READ) ;
     try {
       ...
     } finally { dataset.end() ; }

The `dataset.end()` declares the end of the read transaction.  Applications may also call
`dataset.commit()` or `dataset.abort()` which all have the same effect for a read transaction.

     Location location = ... ;
     Dataset dataset = ... ;
     dataset.begin(ReadWrite.READ) ;
     String qs1 = "SELECT * {?s ?p ?o} LIMIT 10" ;        

     try(QueryExecution qExec = QueryExecution.dataset(dataset).query(qs1).build() ) {
         ResultSet rs = qExec.execSelect() ;
         ResultSetFormatter.out(rs) ;
     } 

     String qs2 = "SELECT * {?s ?p ?o} OFFSET 10 LIMIT 10" ;  
     try(QueryExecution qExec = QueryExecution.dataset(dataset).query(qs2).build() ) {
         rs = qExec.execSelect() ;
         ResultSetFormatter.out(rs) ;
     }

### Write transactions

These are used for SPARQL queries, SPARQL updates and any Jena API
actions that modify the data.  Beware that large `model.read` 
operations consume large amounts of temporary space.

The general pattern is:

     dataset.begin(ReadWrite.WRITE) ;
     try {
       ...
       dataset.commit() ;
     } finally { 
       dataset.end() ; 
     }

The  `dataset.end()` will abort the transaction is there was no call to
`dataset.commit()` or `dataset.abort()` inside the write transaction.

Once `dataset.commit()` or `dataset.abort()` is called, the application
needs to start a new transaction to perform further operations on the 
dataset.

     Location location = ... ;
     Dataset dataset = ... ;
     dataset.begin(ReadWrite.WRITE) ;
        
     try {
         Model model = dataset.getDefaultModel() ;
         // API calls to a model in the dataset

         model.add( ... )

         // A SPARQL query will see the new statement added.
         try (QueryExecution qExec = QueryExecution.dataset(dataset)
                 .query("SELECT (count(*) AS ?count) { ?s ?p ?o} LIMIT 10")
                 .build() ) {
             ResultSet rs = qExec.execSelect() ;
             ResultSetFormatter.out(rs) ;
         }

         // ... perform a SPARQL Update
         String sparqlUpdateString = StrUtils.strjoinNL(
              "PREFIX . <http://example/>",
              "INSERT { :s :p ?now } WHERE { BIND(now() AS ?now) }"
              ) ;

         UpdateRequest request = UpdateFactory.create(sparqlUpdateString) ;
         UpdateExecution.dataset(dataset).update(request).execute();
            
         // Finally, commit the transaction. 
         dataset.commit() ;
         // Or call .abort()
        } finally { 
            dataset.end() ; 
        }

## Multi-threaded use

Each dataset object has one transaction active at a time per thread. 
A dataset object can be used by different threads, with independent transactions.

The usual idiom within multi-threaded applications is to have 
one dataset per thread, and so there is one transaction per thread.

Either:

     // Create a dataset and keep it globally.
     Dataset dataset = TDBFactory.createDataset(location) ;

Thread 1:

     dataset.begin(ReadWrite.WRITE) ;
     try {
       ...
       dataset.commit() ;
     } finally { dataset.end() ; }

Thread 2:

     dataset.begin(ReadWrite.READ) ;
     try {
       ...
     } finally { dataset.end() ; }

or create a dataset object on the thread:

Thread 1:

     Dataset dataset = TDBFactory.createDataset(location) ;
     dataset.begin(ReadWrite.WRITE) ;
     try {
       ...
       dataset.commit() ;
     } finally { dataset.end() ; }

Thread 2:

     Dataset dataset = TDBFactory.createDataset(location) ;
     dataset.begin(ReadWrite.READ) ;
     try {
       ...
     } finally { dataset.end() ; }

Each thread has a separate `dataset` object; these safely share the 
same storage. in both cases, the transactions are independent.

## Multi JVM

Multiple applications, running in multiple JVMs, using the same
file databases is not supported and has a high risk of data corruption.  Once corrupted a database cannot be repaired
and must be rebuilt from the original source data. Therefore there **must** be a single JVM
controlling the database directory and files. TDB includes automatic prevention against multi-JVM usage
which prevents this under most circumstances.

Use [Fuseki](../fuseki2/) to provide a database server for multiple
applications. Fuseki supports [SPARQL
Query](http://www.w3.org/TR/sparql11-query/), [SPARQL
Update](http://www.w3.org/TR/sparql11-update/) and the [SPARQL Graph Store
protocol](http://www.w3.org/TR/sparql11-http-rdf-update/).

## Bulk loading

Bulk loaders are not transactional.
