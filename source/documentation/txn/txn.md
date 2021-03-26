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

This can be simplified by wrapping application code, contained in a Java lambda
expression or a Java Runnable object, and calling a method of the daatset or
other transactional object.  This wil apply the correct entry and exit code for
a transaction, eliminating coding errors.

This is also available via transactional objects such as `Dataset`.

The pattern is:

    Dataset dataset = ...
    dataset.executeRead(()-> {
        . . .
    }) ;

and

    dataset.executeWrite(()-> {
        . . .
    }) ;

The form is:

    Txn.executeRead(ds, ()-> {
        . . .
    }) ;

and

    Txn.executeWrite(ds, ()-> {
        . . .
    }) ;

is also avilable (`Txn` is the implementation of this machinary). Using Txn is
this way is necessary for Jena3.

## Usage

This first example shows how to write a SPARQL query .

    Dataset dataset = ... ;
    Query query = ... ;
    dataset.executeRead(()-> {
        try(QueryExecution qExec = QueryExecutionFactory.create(query, dataset)) {
            ResultSetFormatter.out(qExec.execSelect()) ;
        }
    }) ;

Here, a `try-with-resources` ensures correct handling of the
`QueryExecution` inside a read transaction.

Writing to a file is a read-action (it does not update the RDF data, the
writer needs to read the dataset or model):

    Dataset dataset = ... ;
    dataset.executeRead(()-> {
        RDFDataMgr.write(System.out, dataset, Lang.TRIG) ;
    }) ;

whereas reading data into an RDF dataset needs to be a write transaction
(the dataset or model is changed).

    Dataset dataset = ... ;
    dataset.executeWrite(()-> {
        RDFDataMgr.read("data.ttl") ;
    }) ;

Applications are not limited to a single operation inside a transaction. It
can involve multiple applications read operations, such as making several
queries:

    Dataset dataset = ... ;
    Query query1 = ... ;
    Query query2 = ... ;
    dataset.executeRead(()-> {
         try(QueryExecution qExec1 = QueryExecutionFactory.create(query1, dataset)) {
             ...
         }
         try(QueryExecution qExec2 = QueryExecutionFactory.create(query2, dataset)) {
             ...
         }
    }) ;

A `calculateRead` block can return a result but only with the condition
that what is returned does not touch the data again unless it uses a new
transaction.

This includes returning a result set or returning a model from a dataset.

`ResultSets` by default stream - each time `hasNext` or `next` is
called, new data might be read from the RDF dataset.  A copy of the
results needs to be take:

    Dataset dataset = ... ;
    Query query = ... ;
    List<String> results = dataset.calculateRead(()-> {
         List<String> accumulator = new ArrayList<>() ;
         try(QueryExecution qExec = QueryExecutionFactory.create(query, dataset)) {
             qExec.execSelect().forEachRemaining((row)->{
                 String strThisRow = row.getLiteral("variable").getLexicalForm() ;
                 accumulator.add(strThisRow) ;
             }) ;
         }
         return accumulator ;
    }) ;
    // use "results"

    Dataset dataset = ... ;
    Query query = ... ;
    ResultSet List<String> resultSet = dataset.calculateRead(()-> {
         List<String> accumulator = new ArrayList<>() ;
         try(QueryExecution qExec = QueryExecutionFactory.create(query, dataset)) {
             return ResultSetFactory.copyResults(qExec.execSelect()) ;
         }
    }) ;
    // use "resultSet"

The functions `execute` and `calculate` start `READ_PROMOTE`
transactions which start in "read" mode but convert to "write" mode if
needed.  For details of transaction promotion see the
[section in the transaction API documentation](transactions_api.html#types-modes-promotion).

## Working with RDF Models

The unit of transaction is the dataset.  Model in datasets are just views of that dataset.
Model should not be passed out of a transaction because they are still attached to the
dataset.

## Autocommit and Transaction continuation

If there is a transaction already started for the thread, then 
`execute...` or `calculate...` will be performed as part of
the transaction and that transaction is not terminated.  If there is not transaction already started,
a transaction is wrapped around the `execute...` or `calculate...` action.

    Dataset dataset = ...
    // Main transaction.
    dataset.begin(ReadWrite.WRITE) ;
    try {
      ...
      // Part of the transaction above.
      dataset.executeRead(() -> ...) ;
      ...
      // Part of the transaction above - no commit/abort
      dataset.executeWrite(() -> ...) ;

      // Outer transaction
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

See [`Txn.java`](https://github.com/apache/jena/blob/main/jena-arq/src/main/java/org/apache/jena/query/Txn.java) for full details.
