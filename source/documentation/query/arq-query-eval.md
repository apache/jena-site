---
title: ARQ - Extending Query Execution
---

This page describes the mechanisms that can be used to extend and
modify query execution within ARQ. Through these mechanisms, ARQ
can be used to query different graph implementations and to provide
different query evaluation and optimization strategies for
particular circumstances. These mechanisms are used by
[TDB](../tdb).

ARQ can be [extended in various ways](extension.html) to
incorporate custom code into a query.
[Custom filter functions](extension.html#filter-functions) and
[property functions](extension.html#property-functions) provide ways
to add application specific code. The
[free text search](/documentation/query/text-query.html) capabilities, using Apache
Lucene, are provided via a property function. Custom filter
functions and property functions should be used where possible.

Jena itself can be extended by providing a new implementation of
the `Graph` interface. This can be used to encapsulate specific
specialised storage and also for wrapping non-RDF sources to look
like RDF. There is a common implementation framework provided by
`GraphBase` so only one operation, the `find` method, needs to be
written for a read-only data source. Basic find works well in many
cases, and the whole Jena API will be able to use the extension. 
For higher SPARQL performance, ARQ can be extended at the
[basic graph matching](#graph-matching-and-a-custom-stagegenerator) or
[algebra level](#opexecutor).

Applications writers who extend ARQ at the query execution level
should be prepared to work with the source code for ARQ for
specific details and for finding code to reuse. Some examples can be
found [arq/examples directory](https://github.com/apache/jena/tree/main/jena-examples/src/main/java/arq/examples/) 

-   [Overview of ARQ Query processing](#overview-of-arq-query-processing)
-   [The Main Query Engine](#the-main-query-engine)
-   [Graph matching and a custom StageGenerator](#graph-matching-and-a-custom-stagegenerator)
-   [OpExecutor](#opexecutor)
-   [Quads](#quads)
-   [Mixed Graph Implementation Datasets](#mixed-graph-implementation-datasets)
-   [Custom Query Engines](#custom-query-engines)
-   [Extend the algebra](#algebra-extensions)

## Overview of ARQ Query Processing

The sequence of actions performed by ARQ to perform a query are
parsing, algebra generation, execution building, high-level
optimization, low-level optimization and finally evaluation. It is
not usual to modify the parsing step nor the conversion from the
parse tree to the algebra form, which is a fixed algorithm defined
by the SPARQL standard. Extensions can modify the algebra form by
transforming it from one algebra expression to another, including
introducing new operators. See also the documentation on
[working with the SPARQL algebra in ARQ](algebra.html) including
building algebra expressions programmatically, rather than
obtaining them from a query string.

### Parsing

The parsing step turns a query string into a `Query` object. The
class `Query` represents the abstract syntax tree (AST) for the
query and provides methods to create the AST, primarily for use by
the parser. The query object also provides methods to serialize the
query to a string. Because this is from an AST, the string produced will be
very close to the original query with the same syntactic elements,
but without comments, and formatted with whitespace for
readability. It is not usually the best way to build a query
programmatically and the AST is not normally an extension point.

The query object can be used many times. It is not modified once
created, and in particular it is not modified by query execution.

### Algebra generation

ARQ generates the
[SPARQL algebra](http://www.w3.org/TR/sparql11-query/#sparqlQuery)
expression for the query. After this a number of transformations
can be applied (for example, identification of property functions)
but the first step is the application of the algorithm in the
SPARQL specification for translating a SPARQL query string, as held
in a `Query` object into a SPARQL algebra expression. This includes
the process of removing joins involving the identity pattern (the
empty graph pattern).

For example, the query:

    PREFIX foaf: <http://xmlns.com/foaf/0.1/>
    SELECT ?name ?mbox ?nick
    WHERE  { ?x foaf:name  ?name ;
                foaf:mbox  ?mbox .
             OPTIONAL { ?x  foaf:nick  ?nick }
           }

becomes

    (prefix ((foaf: <http://xmlns.com/foaf/0.1/>))
      (project (?name ?mbox ?nick)
        (leftjoin
          (bgp
            (triple ?x foaf:name ?name)
            (triple ?x foaf:mbox ?mbox)
          )
          (bgp (triple ?x foaf:nick ?nick)
          )
        )))

using the [SSE syntax](../notes/sse.html) to write out
the internal data-structure for the algebra.

The [online SPARQL validator](http://www.sparql.org/validator.html)
at [sparql.org](http://sparql.org/) can be used to see the algebra
expression for a SPARQL query. This validator is also included in
[Fuseki](../fuseki2/).

### High-Level Optimization and Transformations

There is a collection of transformations that can be applied to the
algebra, such as replacing equality filters with a more efficient
graph pattern and an assignment. When extending ARQ, a query
processor for a custom storage layout can choose which
optimizations are appropriate and can also provide its own algebra
transformations.

A transform is code that converts an algebra operation into other
algebra operations. It is applied using the `Transformer` class:

    Op op = ... ;
    Transform someTransform = ... ;
    op = Transformer.transform(someTransform, op) ;

The `Transformer` class applies the transform to each operation in
the algebra expression tree. `Transform` itself is an interface,
with one method signature for each operation type, returning a
replacement for the operator instance it is called on.

One such transformation is to turn a SPARQL algebra expression
involving named graphs and triples into one using quads. This
transformation is performed by a call to `Algebra.toQuadForm`.

Transformations proceed from the bottom of the expression tree to
the top. Algebra expressions are best treated as immutable so a
change made in one part of the tree should result in a copy of the
tree above it.  This is automated by the  `TransformCopy` class
which is the commonly used base class for writing transforms. The
other helper base class is `TransformBase,` which provides the
identify operation (returns the node supplied) for each transform
operation.

Operations can be printed out in
[SSE](../notes/sse.html) syntax. The Java `toString`
method is overridden to provide pretty printing and the static
methods in `WriterOp` provide output to various output objects like
`java.io.OutputStream`.

### Low-Level Optimization and Evaluation

The step of evaluating a query is the process of executing the
algebra expression, as modified by any transformations applied, to
yield a stream of pattern solutions. Low-level optimizations
include choosing the order in which to evaluate basic graph
patterns. These are the responsibility of the custom storage layer.
Low-level optimization can be carried out dynamically as part of
evaluation.

Internally, ARQ uses iterators extensively. Where possible,
evaluation of an operation is achieved by feeding the stream of
results from the previous stage into the evaluation. A common
pattern is to take each intermediate result one at a time (use
`QueryIterRepeatApply` to be called for each binding) ,
substituting the variables of pattern with those in the incoming
binding, and evaluating to a query iterator of all results for this
incoming row. The result can be the empty iterator (one that always
returns false for `hasNext`). It is also common to not have to
touch the incoming stream at all but merely to pass it to
sub-operations.

### Query Engines and Query Engine Factories

The steps from algebra generation to query evaluation are carried
out when a query is executed via the `QueryExecution.execSelect` or
other `QueryExecution` exec operation. It is possible to carry out
storage-specific operations when the query execution is created. A
query engine works in conjunction with a `QueryExecution`
to provide the evaluation of a query
pattern. `QueryExecutionBase` provides all the machinery for the
different result types and does not need to be modified by
extensions to query execution.

ARQ provides three query engine factories; the main query engine
factory, one for a reference query engine and one to remotely
execute a query. TDB provides its own query engine
factories which they register during sub-system initialization.
Both extend the main query engine described below.

The reference query engine is a direct top-down evaluation of the
expression. Its purpose is to be simple so it can be easily
verified and checked then its results used to check more
complicated processing in the main engine and other
implementations. All arguments to each operator are fully evaluated
to produce intermediate in-memory tables then a simple
implementation of the operator is called to calculate the results.
It does not scale and does not perform any optimizations. It is
intended to be clear and simple; it is not designed to be
efficient.

Query engines are chosen by referring to the registry of query
engine factories.

    public interface QueryEngineFactory
    {
        public boolean accept(Query query, DatasetGraph dataset, Context context) ;
        public Plan create(Query query, DatasetGraph dataset, Binding inputBinding, Context context) ;

        public boolean accept(Op op, DatasetGraph dataset, Context context) ;
        public Plan create(Op op, DatasetGraph dataset, Binding inputBinding, Context context) ;
    }

When the query execution factory is given a dataset and query, the
query execution factory tries each registered engine factory in
turn calling the `accept` method (for query or algebra depending on
how it was presented). The registry is kept in reverse registration
order - the most recently registered query engine factory is tried
first. The first query engine factory to return true is chosen and
no further engine factories are checked.

When a query engine factory is chosen, the `create` method is
called to return a `Plan` object for the execution. The main
operation of the `Plan` interface is to get the `QueryIterator` for
the query.

See the example `arq.examples.engine.MyQueryEngine` at
[jena-examples:arq/examples](https://github.com/apache/jena/tree/main/jena-examples/src/main/java/arq/examples/).

## The Main Query Engine

The main query engine can execute any query. It contains a number
of basic graph pattern matching implementations including one that
uses the `Graph.find` operation so it can work with any
implementation of the Jena Graph SPI. The main query engine works
with general purpose datasets but not directly with quad stores; it
evaluates patterns on each graph in turn. The main query engine
includes optimizations for the standard Jena implementation of
in-memory graphs.

High-level optimization is performed by a sequence of
transformations. This set of optimizations is evolving. A custom
implementation of a query engine can reuse some or all of these
transformations (see `Algebra.optimize` which is the set of
transforms used by the main query engine).

The main query engine is a streaming engine. It evaluates
expressions as the client consumes each query solution. After
preparing the execution by creating the initial conditions (a
partial solution of one row and no bound variables or any initial
bindings of variables), the main query engine calls `QC.execute`
which is the algorithm to execute a query. Any extension that
wished to reuse some of the main query engine by providing its own
`OpExecutor` must call this method to evaluate a sub-operation.

`QC.execute` finds the currently active `OpExecutor` factory,
creates an `OpExecutor` object and invokes it to evaluate one
algebra operation.

There are two points of extension for the main query engine:

-   Stage generators, for evaluating basic graph patterns and
    reusing the rest of the engine.
-   `OpExecutor` to execute any algebra operator specially.

The standard `OpExecutor` invokes the stage generator mechanism to
match a basic graph pattern.

## Graph matching and a custom StageGenerator

The correct point to hook into ARQ for just extending basic graph
pattern matching (BGPs) is to provide a custom `StageGenerator`. 
(To hook into filtered basic graph patterns, the extension will
need to provide its own `OpExecutor` factory). The advantage of
the `StageGenerator` mechanism, as compared to the more general
`OpExecutor` described below, is that it more self-contained and
requires less detail about the internal evaluation of the other
SPARQL algebra operators.  This extension point corresponds to
section 12.6
"[Extending SPARQL Basic Graph Matching](http://www.w3.org/TR/sparql11-query/#sparqlBGPExtend)".

Below is the default code to match a BGP from
`OpExecutor.execute(OpBGP, QueryIterator)`. It merely calls fixed
code in the `StageBuilder` class.The input is a stream of results
from earlier stages. The execution must return a query iterator
that is all the possible ways to match the basic graph pattern for
each of the inputs in turn. Order of results does not matter. 

    protected QueryIterator execute(OpBGP opBGP, QueryIterator input)
    {
        BasicPattern pattern = opBGP.getPattern() ;
        return StageBuilder.execute(pattern, input, execCxt) ;
    }

The `StageBuilder` looks for the stage generator by accessing the
context for the execution:

    StageGenerator stageGenerator = (StageGenerator)context.get(ARQ.stageGenerator) ;

where the context is the global context and any query execution
specific additions together with various execution control
elements.

A `StageGenerator` is an implementation of:

        public interface StageGenerator
        {
            public QueryIterator execute(BasicPattern pattern,
                                         QueryIterator input,
                                         ExecutionContext execCxt) ;
        }

### Setting the Stage Generator

An extension stage generator can be registered on a per-query
execution basis or (more usually) in the global context.

        StageBuilder.setGenerator(Context, StageGenerator)

The global context can be obtained by a call to `ARQ.getContext()`

        StageBuilder.setGenerator(ARQ.getContext(), myStageGenerator) ;

In order to allow an extensions to still permit other graphs to be
used, stage generators are usually chained, with each new custom
one passing the execution request up the chain if the request is
not supported by this custom stage generator.

    public class MyStageGenerator implements StageGenerator
    {
        StageGenerator above = null ;

        public MyStageGenerator (StageGenerator original)
        { above = original ; }

        @Override
        public QueryIterator execute(BasicPattern pattern, QueryIterator input, ExecutionContext execCxt)
        {
            Graph g = execCxt.getActiveGraph() ;
            // Test to see if this is a graph we support.
            if ( ! ( g instanceof MySpecialGraphClass ) )
                // Not us - bounce up the StageGenerator chain
                return above.execute(pattern, input, execCxt) ;
            MySpecialGraphClass graph = (MySpecialGraphClass )g ;
            // Create a QueryIterator for this request
         ...


This is registered by setting the global context (`StageBuilder`
has a convenience operation to do this):

      // Get the standard one.
      StageGenerator orig = (StageGenerator)ARQ.getContext().get(ARQ.stageGenerator) ;
      // Create a new one
      StageGenerator myStageGenerator= new MyStageGenerator(orig) ;
      // Register it
      StageBuilder.setGenerator(ARQ.getContext(), myStageGenerator) ;


Example:
[jena-examples:arq/examples/bgpmatching](https://github.com/apache/jena/tree/main/jena-examples/src/main/java/arq/examples/bgpmatching/)

## OpExecutor

A `StageGenerator` provides matching for a basic graph pattern. If
an extension wishes to take responsibility for more of the
evaluation then it needs to work with `OpExecutor`. This includes
evaluation of filtered basic graph patterns.

An example query using a filter:

    PREFIX  dc:   <http://purl.org/dc/elements/1.1/>
    PREFIX  books: <http://example.org/book/>

    SELECT  *
    WHERE
      { ?book  dc:title  ?title .
        FILTER regex(?title, "Paddington")
      }

 results in the algebra expression for the pattern:

        (filter (regex ?title "Paddington")
            (bgp (triple ?book dc:title ?title)
            ))

showing that the filter is being applied to the results of a basic
graph pattern matching.

Note: this is not the way to provide custom filter operations.  See
the documentation for
[application-provided filter functions](extension.html#filter-functions).

Each step of evaluation in the main query engine is performed by a
`OpExecutor` and a new one is created from a factory at each step. 
The factory is registered in the execution context. The
implementation of a specialized `OpExecutor` can inherit from the
standard one and override only those algebra operators it wishes to
deal with, including inspecting the execution and choosing to
pass up to the super-class based on the details of the
operation.  From the query above, only regex filters might be
specially handled.

Registering an `OpExecutorFactory`:

    OpExecutorFactory customExecutorFactory = new MyOpExecutorFactory(...) ;
    QC.setFactory(ARQ.getCOntext(), customExecutorFactory) ;

`QC` is a point of indirection that chooses the execution process at
each stage in a query so if the custom execution wishes to evaluate
an algebra operation within another operation, it should call
`QC.execute`. Be careful not to loop endlessly if the operation is
itself handled by the custom evaluator. This can be done by
swapping in a different `OpExecutorFactory`.

       // Execute an operation with a different OpExecution Factory

       // New context.
       ExecutionContext ec2 = new ExecutionContext(execCxt) ;
       ec2.setExecutor(plainFactory) ;

       QueryIterator qIter = QC.execute(op, input, ec2) ;

       private static OpExecutorFactory plainFactory =
          new OpExecutorFactory()
          {
             @Override
             public OpExecutor create(ExecutionContext execCxt)
             {
                 // The default OpExecutor of ARQ.
                 return new OpExecutor(execCxt) ;
             }
          } ;

## Quads

If a custom extension provides named graphs, then it may be useful
to execute the quad form of the query. This is done by writing a
custom query engine and overriding `QueryEngineMain.modifyOp`:

      @Override
      protected Op modifyOp(Op op)
      {
         op = Substitute.substitute(op, initialInput) ;
         // Use standard optimizations.
         op = super.modifyOp(op) ;
         // Turn into quad form.
         op = Algebra.toQuadForm(op) ;
         return op ;
      }

The extension may need to provide its own dataset implementation so
that it can detect when queries are directed to its named graph
storage. [TDB](../tdb/) are examples of this.

## Mixed Graph Implementation Datasets

The dataset implementation used in normal operation does not work
on quads but instead can provide a dataset with a collection of
graphs each from different implementation sub-systems. In-memory
graphs can be mixed with database backed graphs as well as custom
storage systems. Query execution proceeds per-graph so that an
custom `OpExecutor` will need to test the graph to work with to
make sure it is of the right class. The pattern in the
`StageGenerator` extension point is an example of a design pattern in
that situation.

## Custom Query Engines

A custom query engine enables an extension to choose which datasets
it wishes to handle. It also allows the extension to intercept
query execution during the setup of the execution so it can modify
the algebra expression, introduce its own algebra extensions,
choose which high-level optimizations to apply and also transform
to the expression into quad form. Execution can proceed with the
normal algorithm or a custom `OpExecutor` or a custom Stage
Generator or a combination of all three extension mechanism.

Only a small, skeleton custom query engine is needed to intercept
the initial setup. See the example in
[jena-examples:arq/examples](https://github.com/apache/jena/tree/main/jena-examples/src/main/java/arq/examples/)
`arq.examples.engine.MyQueryEngine`.

While it is possible to replace the entire process of query
evaluation, this is a substantial endeavour. `QueryExecutionBase`
provides the machinery for result presentation (`SELECT`,
`CONSTRUCT`, `DESCRIBE`, `ASK`), leaving the work of pattern
evaluation to the custom query engine.

## Algebra Extensions

New operators can be added to the algebra using the `OpExt` class
as the super-class of the new operator. They can be inserted into
the expression to be evaluated using a custom query engine to
intercept evaluation initialization.  When evaluation of a query
requires the evaluation of a sub-class of `OpExt`, the `eval`
method is called.
