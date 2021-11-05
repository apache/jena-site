---
title: Explaining ARQ queries
---

Optimization in ARQ proceeds on two levels. After the query is parsed,
the SPARQL algebra for the query is generated as described in the SPARQL
specification. High-level optimization occurs by rewriting the algebra
into new, equivalent algebra forms and introducing specialized algebra
operators. During query execution, the low-level, storage-specific
optimization occurs such as choosing the order of triple patterns within
basic graph patterns.

The effect of [high-level optimizations](#algebra-transformations) can
be seen using `arq.qparse` and the low-level runtime optimizations can
be seen by [execution logging](#execution-logging).

## Algebra Transformations

The preparation for a query for execution can be investigated with the
command `arq.qparse --explain --query QueryFile.rq`. Different storage
systems may perform different optimizations, usually chosen from the
standard set. `qparse` shows the action of the memory-storage optimizer
which applies all optimizations.

Other useful arguments are:

**qparse arguments**

Argument | Effect
-------- | -----
`--print=query` | Print the parsed query
`--print=op` | Print the SPARQL algebra for the query. This is exactly the algebra specified by the SPARQL standard.
`--print=opt` | Print the optimized algebra for the query.
`--print=quad` | Print the quad form algebra for the query.
`--print=optquad` | Print the quad-form optimized algebra for the query.

The argument `--explain` is equivalent to `--print=query --print=opt`

Examples:

    arq.qparse --explain --query Q.rq

    arq.qparse --explain 'SELECT * { ?s ?p ?o }'

## Execution Logging

ARQ can log query and update execution details globally or for an
individual operations. This adds another level of control on top of the
logger level controls.

From command line:

    arq.sparql --explain --data ... --query ...

Explanatory messages are controlled by the `Explain.InfoLevel` level in
the execution context.

Execution logging at level `ALL` can cause a significant slowdown in
query execution speeds but the order of operations logged will be
correct.

The logger used is called `org.apache.jena.arq.exec`. Message are sent
at level "info". So for log4j2, the following can be set in the
`log4j2.properties` file:

    logger.arq-exec.name  = org.apache.jena.arq.exec
    logger.arq-exec.level = INFO

The context setting is for key (Java constant) `ARQ.symLogExec`. To set
globally:

    ARQ.setExecutionLogging(Explain.InfoLevel.ALL) ;

and it may also be set on an individual query execution using its local
context.

     try(QueryExecution qExec = QueryExecution.create() ... .set(ARQ.symLogExec, Explain.InfoLevel.ALL).build() ) {
         ResultSet rs = qExec.execSelect() ;
         ...
     }

On the command line:

     arq.query --explain --data data file --query=queryfile

The command tdbquery takes the same --explain argument.

Logging information levels: see the [logging page](logging.html)

