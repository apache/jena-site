---
title: TDB Configuration
---

There are a number of configuration options that affect the
operation of TDB.

## Contents

-   [Setting Options](#setting-options)
    -   [Setting from the command line](#setting-from-the-command-line)
    -   [Setting with Java System properties](#setting-with-java-system-properties)
-   [Query of the union of named graphs](#query-of-the-union-of-named-graphs)
-   [Logging Query Execution](#logging-query-execution)
-   [Dataset Caching](#dataset-caching)
-   [File Access Mode](#file-access-mode)
-   [TDB Configuration Symbols](#tdb-configuration-symbols)
-   [Advanced Store Configuration](#advanced-store-configuration)

## Setting Options

Options can be set globally, through out the JVM, or on a per query
execution basis. TDB uses the same mechanism as
[ARQ](http://jena.sf.net/ARQ "http://jena.sf.net/ARQ").

There is a global context, which is give to each query
execution as it is created. Modifications to the global context
after the query execution is created are not seen by the query
execution. Modifications to the context of a single query execution
do not affect any other query execution nor the global context.

A context is a set of symbol/value pairs. Symbols are used created
internal to ARQ and TDB and accessed via Java constants. Values are
any Java object, together with the values `true` and `false`, which
are short for the constants of class `java.lang.Boolean`.

Setting globally:

     TDB.getContext().set(symbol, value) ;

Per query execution:

    try(QueryExecution qExec = QueryExecution.dataset(dataset)
                .query(query).set(ARQ.symLogExec,true).build() ) {
         ....
    }

Setting for a query execution happens before any query compilation
or setup happens. Creation of a query execution object does not
compile the query, which happens when the appropriate `.exec`
method is called.

#### Setting from the command line

Options can also set from the
[command line](commands.html#setting-options-from-the-command-line "TDB/Commands")
with "`--set`.

#### Setting with Java System properties

(TDB 0.8.5 and later)

Options can be set when invoking the JVM using the Java system
properties as set by "`-D`".

## Query of the union of named graphs

See [TDB/Datasets](datasets.html "TDB/Datasets").

## Logging Query Execution

If the symbol "`tdb:logExec`" is set to "true", and also the logger
`org.apache.jena.tdb.exec` is enabled from level "info", then each
basic graph patterns is logged before execution. This pattern
logged is after substitution of variable values and after
optimization by the
[BGP optimizer](optimizer.html "TDB/Optimizer").

## Dataset Caching

(TDB 0.8.0 and later)

TDB caches datasets based on the location of the backing directory.
Within a single JVM, all attempts to create or open a dataset at a
particular location go through the same dataset (and same disk
caching). Therefore, an application can open the same location
several times in different places in the code and still get the
same underlying dataset for query and update.

Note that closing the dataset closes it everywhere (the opening
calls are not being reference counted).

## File Access Mode

The context symbol can be set to "mapped" or "direct". Unset, or
the value "default", ask TDB to use to make the choice based on
JVM. Leaving it to the default is *strongly* encouraged.

## TDB Configuration Symbols

Configuration Symbols

Symbol | Java Constant | Effect | Default
------ | ------------- | ------ | -------
`tdb:logExec` | `TDB.symLogExec` | Log execution of BGPs. Set to "true" to enable. Must also enable the logger "org.apache.jena.tdb.exec". | unset
`tdb:unionDefaultGraph` | `TDB.symUnionDefaultGraph` | Query patterns on the default graph match against the union of the named graphs. | unset
`tdb:fileMode` | `SystemTDB.fileMode` | Force use of memory mapped files (`"mapped"`) or direct file caching (`"direct"`). See discussion of TDB on 32 or 64 bit hardware, especially limitations of memory mapped files on 32 bit Java. | Set by the system based on 32 or 64 bit java.

## Advanced Store Configuration

Various internal caching sizes can be set to different values to the
defaults. See the [full description](store-parameters.html).
