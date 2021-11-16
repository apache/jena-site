---
title: ARQ - SPARQL Algebra
---

A SPARQL query in ARQ goes through several stages of processing:

-   String to Query (parsing)
-   Translation from Query to a SPARQL algebra expression
-   Optimization of the algebra expression
-   Query plan determination and low-level optimization
-   Evaluation of the query plan

This page describes how to access and use expressions in the SPARQL
algebra within ARQ. The definition of the SPARQL algebra is to be
found in the SPARQL specification in
[section 12](http://www.w3.org/TR/sparql11-query/#sparqlDefinition).
[ARQ can be extended](arq-query-eval.html) to modify the evaluation
of the algebra form to access different graph storage
implementations.

The classes for the datastructures for the algebra resize in the
package `org.apache.jena.sparql.algebra` in the `op` subpackage. 
All the classes are names "`Op...`"; the interface that they all
offer is "`Op`".

## Viewing the algebra expression for a Query

The command line tool [arq.qparse](cmds.html#arq.qparse) will print
the algebra form of a query:

    arq.qparse --print=op --query=Q.rq
    arq.qparse --print=op 'SELECT * { ?s ?p ?o}'

The syntax of the output is [SSE](../notes/sse.html), a
simple format for writing data structures involving RDF terms. It
can be read back in again to produce the Java form of the algebra
expression.

## Turning a query into an algebra expression

Getting the algebra expression for a Query is simply a matter of
passing the parsed Query object to the transaction function in the
`Algebra` class:

    Query query = QueryFactory.create(.....) ;
    Op op = Algebra.compile(query) ;

And back again.

    Query query = OpAsQuery.asQuery(op) ;
    System.out.println(query.serialize()) ;

This reverse translation can handle any algebra expression
originally from a SPARQL Query, but not any algebra expression.  It
is possible to create programmatically useful algebra expressions
that can not be turned into a query, especially if they involve
algebra.  Also, the query produced may not be exactly the same but
will yield the same results (for example, filters may be moved
because the SPARQL query algebra translation in the SPARQL
specification moves filter expressions around).

## Directly reading and writing algebra expression

The SSE class is a collection of functions to parse SSE expressions
for the SPARQL algebra but also RDF terms, filter expressions and
even dataset and graphs.

    Op op = SSE.parseOp("(bgp (?s ?p ?o))") ;    // Read a string

    Op op = SSE.readOp("filename.sse") ;     // Read a file

The SSE class simply calls the appropriate builder operation from
the `org.apache.jena.sparql.sse.builder` package.

To go with this, there is a collection of writers for many of the
Java structures in ARQ. 

    Op op = ... ;
    SSE.write(op) ;      // Write to stdout

Writers default to writing to `System.out` but support calls to any
output stream (it manages the conversion to UTF-8) and ARQ own
`IndentedWriter`s form for embedding in structured output.  Again,
SSE is simply passing the calls to the writer operation from the
`org.apache.jena.sparql.sse.writer` package.

## Creating an algebra expression programmatically

See the example in 
[AlgebraExec](https://github.com/apache/jena/tree/main/jena-examples/src/main/java/arq/examples/algebra/AlgebraExec.java).

To produce the complete javadoc for ARQ, download an ARQ
distribution and run the ant task 'javadoc-all'.

## Evaluating a algebra expression

    QueryIterator qIter = Algebra.exec(op,graph) ;

    QueryIterator qIter = Algebra.exec(op,datasetGraph) ;

Evaluating an algebra expression produces a iterator of query
solutions (called Bindings).

    for ( ; qIter.hasNext() ; )
    {
       Binding b = qIter.nextBinding() ;
       Node n = b.get(var_x) ;
       System.out.println(var_x+" = "+FmtUtils.stringForNode(n)) ;
    }
    qIter.close() ;

Operations of `CONSTRUCT`, `DESCRIBE` and `ASK` are done on top
of algebra evaluation. Applications can access this functionality
by creating their own `QueryEngine` (see
`arq.examples.engine.MyQueryEngine`) and it's factory. A query
engine is a one-time use object for each query execution.

[ARQ documentation index](index.html)
