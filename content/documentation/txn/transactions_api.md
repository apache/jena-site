Title: Jena Transactons API

-   [API for Transactions](#api-for-transactions)
    - [Read transactions](#read-transactions)
    - [Write transactions](#write-transactions)
-   [Txn](txn.html) - A higher level API to transactions

## API for Transactions

This page decribes the basic transaction API in Jena (3.1.0 and later).

There is also a [higher-level API](txn.html) useful in many situations
but sometimes it is necessary to use the basic transaction API described here.

### Read transactions

These are used for SPARQL queries and code using the Jena API
actions that do not change the data.  The general pattern is:

     dataset.begin(ReadWrite.READ) ;
     try {
       ...
     } finally { dataset.end() ; }

The `dataset.end()` declares the end of the read transaction.  Applications may also call
`dataset.commit()` or `dataset.abort()` which all have the same effect for a read transaction.

This example has two queries - no updates between or during the queries will be seen by
this code even if another thread commits changes in the lifetime of this transaction.

     Dataset dataset = ... ;
     dataset.begin(ReadWrite.READ) ;
     String qs1 = "SELECT * {?s ?p ?o} LIMIT 10" ;        

     try(QueryExecution qExec = QueryExecutionFactory.create(qs1, dataset)) {
         ResultSet rs = qExec.execSelect() ;
         ResultSetFormatter.out(rs) ;
     }

     String qs2 = "SELECT * {?s ?p ?o} OFFSET 10 LIMIT 10" ;  
     try(QueryExecution qExec = QueryExecutionFactory.create(qs2, dataset)) {
         rs = qExec.execSelect() ;
         ResultSetFormatter.out(rs) ;
     }

### Write transactions

These are used for SPARQL queries, SPARQL updates and any Jena API
actions that modify the data.  Beware that large `model.read`
operations to change a dataset may consume large amounts of temporary space.

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

     Dataset dataset = ... ;
     dataset.begin(ReadWrite.WRITE) ;

     try {
         Model model = dataset.getDefaultModel() ;
         // API calls to a model in the dataset

         // Make some changes via the model ...
         model.add( ... )

         // A SPARQL query will see the new statement added.
         try (QueryExecution qExec = QueryExecutionFactory.create(
                 "SELECT (count(?s) AS ?count) { ?s ?p ?o} LIMIT 10",
               dataset)) {
             ResultSet rs = qExec.execSelect() ;
             ResultSetFormatter.out(rs) ;
         }

         // ... perform a SPARQL Update
         GraphStore graphStore = GraphStoreFactory.create(dataset) ;
         String sparqlUpdateString = StrUtils.strjoinNL(
              "PREFIX . <http://example/>",
              "INSERT { :s :p ?now } WHERE { BIND(now() AS ?now) }"
              ) ;

         UpdateRequest request = UpdateFactory.create(sparqlUpdateString) ;
         UpdateProcessor proc = UpdateExecutionFactory.create(request, graphStore) ;
         proc.execute() ;

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
one dataset, and so there is one transaction per thread.

Either:

     // Create a dataset and keep it globally.
     static Dataset dataset = TDBFactory.createDataset(location) ;

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

It is possible (in TDB) to create different dataset objects to the same location.

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
same storage and have independent transactions.

## Multi JVM

Multiple applications, running in multiple JVMs, using the same file
databases is not supported and has a high risk of data corruption.  Once
corrupted a database cannot be repaired and must be rebuilt from the
original source data. Therefore there **must** be a single JVM
controlling the database directory and files.  From 1.1.0 onwards TDB
includes automatic prevention against multi-JVM which prevents this
under most circumstances.

Use our [Fuseki](../fuseki2/) component to provide a
database server for multiple applications. Fuseki supports
[SPARQL Query](http://www.w3.org/TR/sparql11-query/),
[SPARQL Update](http://www.w3.org/TR/sparql11-update/) and the
[SPARQL Graph Store protocol](http://www.w3.org/TR/sparql11-http-rdf-update/).
