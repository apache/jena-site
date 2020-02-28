---
title: ARQ - Application API
---

The application API is in the package `org.apache.jena.query`.

Other packages contain various parts of the system (execution
engine, parsers, testing etc). Most applications will only need to
use the main package. Only applications wishing to programmatically
build queries or modify the behaviour of the query engine need to
use the others packages directly.

## Key Classes

The package `org.apache.jena.query` is the main application
package.

-   `Query` - a class that represents the application query. It is
    a container for all the details of the query. Objects of class
    Query are normally created by calling one of the methods of
    `QueryFactory` methods which provide access to the various parsers.
-   `QueryExecution` - represents one execution of a query.
-   `QueryExecutionFactory` - a place to get `QueryExecution` instances.
-   `DatasetFactory` - a place to make datasets.
-   For SELECT queries:
    -   `QuerySolution` - A single solution to the query.
    -   `ResultSet` - All the QuerySolutions. An iterator.
    -   `ResultSetFormatter` - turn a ResultSet into various forms;
        into json, text, or as plain XML.


## SELECT queries

The basic steps in making a SELECT query are outlined in the
example below. A query is created from a string using the
`QueryFactory`. The query and model or RDF dataset to be queried
are then passed to `QueryExecutionFactory` to produce an instance
of a query execution. `QueryExecution` objects are `java.lang.AutoCloseable`
and can be used in try-resource. Result are handled in a loop and finally the
query execution is closed.

      import org.apache.jena.query.* ;
      Model model = ... ;
      String queryString = " .... " ;
      Query query = QueryFactory.create(queryString) ;
      try (QueryExecution qexec = QueryExecutionFactory.create(query, model)) {
        ResultSet results = qexec.execSelect() ;
        for ( ; results.hasNext() ; )
        {
          QuerySolution soln = results.nextSolution() ;
          RDFNode x = soln.get("varName") ;       // Get a result variable by name.
          Resource r = soln.getResource("VarR") ; // Get a result variable - must be a resource
          Literal l = soln.getLiteral("VarL") ;   // Get a result variable - must be a literal
        }
      }

It is important to cleanly close the query execution when finished.
System resources connected to persistent storage may need to be
released.

A `ResultSet` supports the Java iterator interface so the
following is also a way to process the results if preferred:

        Iterator<QuerySolution> results = qexec.execSelect() ;
        for ( ; results.hasNext() ; )
        {
            QuerySolution soln = results.next() ;
        . . .
        }

The step of creating a query and then a query execution can be
reduced to one step in some common cases:

      import org.apache.jena.query.* ;
      Model model = ... ;
      String queryString = " .... " ;
      try (QueryExecution qexec = QueryExecutionFactory.create(queryString, model)) {
        ResultSet results = qexec.execSelect() ;
        . . .
      }

### Passing a result set out of the processing loop.

A `ResultSet` is an iterator and can be traversed only once.  What is more, much of query execution
and result set processing is handled internally in a streaming fashion. The `ResultSet` returned
by `execSelect` is not valid after the `QueryExecution` is closed, 
whether explicitly or by
try-resources as the `QueryExecution` implements `AutoCloseable`.

A result set may be materialized - this is then usable outside 

      try (QueryExecution qexec = QueryExecutionFactory.create(queryString, model)) {
          ResultSet results = qexec.execSelect() ;
          results = ResultSetFactory.copyResults(results) ;
          return results ;    // Passes the result set out of the try-resources
      }
The result set from `ResultSetFactory.copyResults` is a `ResultSetRewindable` which has a 
`reset()` operation that positions the iterator at the start of the result again.

This can also be used when the results are going to be used in a loop that modifies
the data.  It is not possible to update the model or dataset while looping
over the results of a `SELECT` query.

The models returned by `execConstruct` and `execDescribe` are valid
after the `QueryExecution` is closed.

### Example: formatting a result set

Instead of a loop to deal with each row in the result set, the
application can call an operation of the `ResultSetFormatter`. This
is what the command line applications do.

Example: processing results to produce a simple text presentation:

        ResultSetFormatter fmt = new ResultSetFormatter(results, query) ;
        fmt.printAll(System.out) ;

or simply:

     ResultSetFormatter.out(System.out, results, query) ;

### Example: Processing results

The results are objects from the Jena RDF API and API calls, which
do not modify the model, can be mixed with query results
processing:

      for ( ; results.hasNext() ; )
      {
          // Access variables: soln.get("x") ;
          RDFNode n = soln.get("x") ; // "x" is a variable in the query
          // If you need to test the thing returned
          if ( n.isLiteral() )
              ((Literal)n).getLexicalForm() ;
          if ( n.isResource() )
          {
             Resource r = (Resource)n ;
              if ( ! r.isAnon() )
              {
                ... r.getURI() ...
              }
          }
      }

Updates to the model must be carried out after the query execution
has finished. Typically, this involves collecting results of
interest in a local datastructure and looping over that structure
after the query execution has finished and been closed.

## CONSTRUCT Queries

`CONSTRUCT` queries return a single RDF graph. As usual, the query
execution should be closed after use.

    Query query = QueryFactory.create(queryString) ;
    QueryExecution qexec = QueryExecutionFactory.create(query, model) ;
    Model resultModel = qexec.execConstruct() ;
    qexec.close() ;

## DESCRIBE Queries

`DESCRIBE` queries return a single RDF graph. 
[Different handlers](extension.html#describeHandlers) for the
`DESCRIBE` operation can be loaded by added by the application.

    Query query = QueryFactory.create(queryString) ;
    QueryExecution qexec = QueryExecutionFactory.create(query, model) ;
    Model resultModel = qexec.execDescribe() ;
    qexec.close() ;

## ASK Queries

The operation Query.execAsk() returns a boolean value indicating
whether the query pattern matched the graph or dataset or not.

    Query query = QueryFactory.create(queryString) ;
    QueryExecution qexec = QueryExecutionFactory.create(query, model) ;
    boolean result = qexec.execAsk() ;
    qexec.close() ;

## Formatting XML results

The `ResultSetFormatter` class has methods to write out the
[SPARQL Query Results XML Format](http://www.w3.org/TR/rdf-sparql-XMLres/).
See ResultSetFormatter.outputAsXML method.

## Datasets

The examples above are all queries on a single model.  A SPARQL
query is made on a dataset, which is a default graph and zero or
more named graphs. Datasets can be constructed using the
`DatasetFactory`:

    String dftGraphURI = "file:default-graph.ttl" ;
    List namedGraphURIs = new ArrayList() ;
    namedGraphURIs.add("file:named-1.ttl") ;
    namedGraphURIs.add("file:named-2.ttl") ;

    Query query = QueryFactory.create(queryString) ;

    Dataset dataset = DatasetFactory.create(dftGraphURI, namedGraphURIs) ;
    try(QueryExecution qExec = QueryExecutionFactory.create(query, dataset)) {
        ...
    }

Already existing models can also be used:

    Dataset dataset = DatasetFactory.create() ;
    dataset.setDefaultModel(model) ;
    dataset.addNamedModel("http://example/named-1", modelX) ;
    dataset.addNamedModel("http://example/named-2", modelY) ;
     try(QueryExecution qExec = QueryExecutionFactory.create(query, dataset)) {
        ...
    }

[ARQ documentation index](index.html)
