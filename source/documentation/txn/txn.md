---
title: Txn - A library for working with Transactions
---

`Txn` provides a high level interface to Jena transactions.  It is a
library over the core functionality - applications do not have to use `Txn`
to use transactions.

Features:

-   Java8 idioms
-   Application exceptions cause transaction aborts.
-   "Transaction continuation" - use any existing active transaction.
-   Autocommit - ensure actions are inside a transaction even if none is active.

## Transactions

The [basic transactions API](basic_txn_api.html) provides operations
`begin`, `commit`, `abort` and `end`.

A write transaction looks like:

    dataset.begin(ReadWrite.write) ;
    try {
        ... write operations ...
        dataset.commit() ;  // Or abort
    } finally {
        dataset.end() ;
    }

`Txn` simplifies writing transaction handling by wrapping application code,
contained in a Java lambda expression or a Java Runnable object, in the correct entry
and exit code for a transaction, eliminating coding errors.

The form is:

    Txn.executeRead(ds, ()-> {
        . . .
    }) ;

and

    Txn.executeWrite(ds, ()-> {
        . . .
    }) ;

## Usage

This first example shows how to write a SPARQL query .

    Dataset ds = ... ;
    Query query = ... ;
    Txn.executeRead(ds, ()-> {
        try(QueryExecution qExec = QueryExecutionFactory.create(query, ds)) {
            ResultSetFormatter.out(qExec.execSelect()) ;
        }
    }) ;

Here, a `try-with-resources` ensures correct handling of the
`QueryExecution` inside a read transaction.

Writing to a file is a read-action (it does not update the RDF data, the
writer needs to read the dataset or model):

    Dataset ds = ... ;
    Txn.executeRead(ds, ()-> {
        RDFDataMgr.write(System.out, ds, Lang.TRIG) ;
    }) ;

whereas reading data into an RDF dataset needs to be a write transaction
(the dataset or model is changed).

    Dataset ds = ... ;
    Txn.executeWrite(ds, ()-> {
        RDFDataMgr.read(ds, "data.ttl") ;
    }) ;

Applications are not limited to a single operation inside a transaction. It
can involve multiple applications read operations, such as making several
queries:

    Dataset ds = ... ;
    Query query1 = ... ;
    Query query2 = ... ;
    Txn.executeRead(ds, ()-> {
         try(QueryExecution qExec1 = QueryExecutionFactory.create(query1, ds)) {
             ...
         }
         try(QueryExecution qExec2 = QueryExecutionFactory.create(query2, ds)) {
             ...
         }
    }) ;

A `Txn.calculateRead` block can return a result but only with the condition
that what is returned does not touch the data again unless it uses a new
transaction.

This includes returning a result set or returning a model from a dataset.

`ResultSets` by default stream - each time `hasNext` or `next` is
called, new data might be read from the RDF dataset.  A copy of the
results needs to be take:

    Dataset ds = ... ;
    Query query = ... ;
    List<String> results = Txn.calculateRead(ds, ()-> {
         List<String> accumulator = new ArrayList<>() ;
         try(QueryExecution qExec = QueryExecutionFactory.create(query, ds)) {
             qExec.execSelect().forEachRemaining((row)->{
                 String strThisRow = row.getLiteral("variable").getLexicalForm() ;
                 accumulator.add(strThisRow) ;
             }) ;
         }
         return accumulator ;
    }) ;
    // use "results"

    Dataset ds = ... ;
    Query query = ... ;
    ResultSet List<String> resultSet = Txn.calculateRead(ds, ()-> {
         List<String> accumulator = new ArrayList<>() ;
         try(QueryExecution qExec = QueryExecutionFactory.create(query, ds)) {
             return ResultSetFactory.copyResults(qExec.execSelect()) ;
         }
    }) ;
    // use "resultSet"

The functions `Txn.execute` and `Txn.calculate` start `READ_PROMOTE`
transactions which start in "read" mode but convert to "write" mode if
needed.  For details of transaction promotion see the
c[section in the transaction API documentation](transactions_api.html#types-modes-promotion).

## Working with RDF Models

The unit of transaction is the dataset.  Model in datasets are just views of that dataset.
Model should not be passed out of a transaction because they are still attached to the
dataset.

## Autocommit and Transaction continuation

If there is a transaction already started for the thread, the `Txn.execute...` will be performed as part of
the transaction and that transaction is not terminated.  If there is not transaction already started,
a transaction is wrapped around the `Txn.execute...` action.

    Dataset dataset = ...
    // Main transaction.
    dataset.begin(ReadWrite.WRITE) ;
    try {
      ...
      // Part of the transaction above.
      Txn.executeRead(dataset, () -> ...) ;
      ...
      // Part of the transaction above - no commit/abort
      Txn.executeWrite(dataset, () -> ...) ;

      dataset.commit() ;
    } finally { dataset.end() ; }

## Design

`Txn` uses Java `Runnable` for the application code, passed into control code
that wraps the transaction operations around the application code. This results
in application code automatically applied transaction begin/commit/end as needed.   

A bare read transaction requires the following code structure (no exception handling):   

      txn.begin(ReadWrite.READ) ;
      try {
         ... application code ...
      } finally { txn.end() ; }

while a write transaction requires either a `commit` or an `abort`
at the end of the application code as well.  

Without the transaction continuation code (simplified, the `Txn` code
for a read transaction takes the form:

    public static <T extends Transactional> void executeRead(T txn, Runnable r) {
        txn.begin(ReadWrite.READ) ;
        try { r.run() ; }
        catch (Throwable th) { txn.end() ; throw th ; }
        txn.end() ;
    }  

See [`Txn.java`](https://github.com/apache/jena/blob/master/jena-arq/src/main/java/org/apache/jena/query/Txn.java) for full details.
