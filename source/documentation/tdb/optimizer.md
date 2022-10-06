---
title: TDB Optimizer
---

Query execution in TDB involves both static and dynamic
optimizations. Static optimizations are transformations of the
SPARQL algebra performed before query execution begins; dynamic
optimizations involve deciding the best execution approach during
the execution phase and can take into account the actual data so
far retrieved.

The optimizer has a number of strategies: a statistics based
strategy, a fixed strategy and a strategy of no reordering.

For the preferred statistics strategy, the TDB optimizer uses
information captured in a per-database statistics file. The file
takes the form of a number of rules for approximate matching counts
for triple patterns. The statistic file can be automatically
generated. The user can add and modify rules to tune the database
based on higher level knowledge, such as inverse function
properties.

## Contents

-   [Quickstart](#quickstart)
-   [Running tdbstats](#running-tdbstats)
-   [Choosing the optimizer strategy](#choosing-the-optimizer-strategy)
-   [Filter placement](#filter-placement)
-   [Investigating what is going on](#investigating-what-is-going-on)
-   [Statistics Rule File](#statistics-rule-file)
    -   [Statistics Rule Language](#statistics-rule-language)
    -   [Abbreviated Rule Form](#abbreviated-rule-form)
    -   [Defaults](#defaults)
-   [Generating a statistics file](#generating-a-statistics-file)
    -   [Generating statistics for Union Graphs](#generating-statistics-for-union-graphs)
-   [Writing Rules](#writing-rules)

The commands look for file `log4j2.properties` in the current directory, as well
as the usual log4j2 initialization with property `log4j.configurationFile` and
looking for classpath resource `log4j2.properties`; there is a default setup of
log4j2 built-in.


## Quickstart

This section provides a practical how-to.

1.  Load data.
2.  Generate the statistics file. Run tdbstats.
3.  Place the file generated in the database directory with the
    name stats.opt.

## Running `tdbstats`

Usage:

     tdbstats --loc=DIR|--desc=assemblerFile [--graph=URI]

## Choosing the optimizer strategy

TDB chooses the basic graph pattern optimizer by the presence of a
file in the database directory.

Optimizer control files

| File name   | Effect   |
| ----------- | -------- |
| `none.opt`  | No reordering - execute triple patterns in the order in the query |
|`fixed.opt`  | Use a built-in reordering based on the number of variables in a triple pattern.
|`stats.opt`  | The contents of this file are the weighing rules (see below).

The contents of the files `none.opt` and `fixed.opt` are not read
and don't matter. They can be zero-length files.

If more then one file is found, the choice is made: `stats.opt`
over `fixed.opt` over `none.opt`.

Optimization can be disabled by setting `arq:optReorderBGP` to false. This can be
done in the Assembler file by setting `ja:context` on the server, dataset, or endpoint:

    [] ja:context [ ja:cxtName "arq:optReorderBGP" ;  ja:cxtValue false ] .


## Filter placement

One of the key optimization is of filtered basic graph patterns.
This optimization decides the best order of triple patterns in a
basic graph pattern and also the best point at which to apply the
filters within the triple patterns.

Any filter expression of a basic graph pattern is placed
immediately after all it's variables will be bound. Conjunctions at
the top level in filter expressions are broken into their
constituent pieces and placed separately.

## Investigating what is going on

TDB can optionally log query execution details. This is controlled
by two setting: the logging level and a context setting. Having two
setting means it is possible to log some queries and not others.

The logger used is called `org.apache.jena.arq.exec`. Messages are
sent at level "INFO". So for log4j2, the following can be set in the
`log4j2.properties` file:

    # Execution logging
    logger.arq-exec.name  = org.apache.jena.arq.exec
    logger.arq-exec.level = INFO

    logger.arq-info.name  = org.apache.jena.arq.info
    logger.arq-info.level = INFO

The context setting is for key (Java constant) `ARQ.symLogExec`. To
set globally:

    ARQ.getContext().set(ARQ.symLogExec,true) ;

and it may also be set on an individual query execution using its
local context.

    try(QueryExecution qExec = QueryExecution.dataset(dataset)
              .query(query)
              .set(ARQ.symLogExec,true)
              .build() ) {
        ResultSet rs = qExec.execSelect() ;
    }

On the command line:

     tdbquery --set arq:logExec=true --file queryfile

This can also be done in the Assembler file by setting `ja:context` 
on the server, dataset, or endpoint:

    [] ja:context [ ja:cxtName "arq:logExec" ;  ja:cxtValue "info" ] .

## Explanation Levels

| Level | Effect |
| ----  | ------ |
| INFO  | Log each query |
| FINE  | Log each query and it's algebra form after optimization |
| ALL   | Log query, algebra and every database access (can be expensive) |
| NONE  | No information logged |

These can be specified as string, to the command line tools, or
using the constants in `Explain.InfoLevel`.

     qExec.getContext().set(ARQ.symLogExec,Explain.InfoLevel.FINE) ;

## tdbquery --explain

The `--explain` parameter can be used for understanding the query execution. 
An execution can detail the query, algebra and every point at which the 
dataset is touched.

For example, given the sample query execution with `tdbquery` below

    tdbquery --loc=DB "SELECT * WHERE { ?a ?b ?c }"

we can include the `--explain` parameter to the command

    tdbquery --explain --loc=DB "SELECT * WHERE { ?a ?b ?c }"

and increase the logging levels, in order to output more information about 
the query execution.

    # log4j2.properties
    log4j.rootLogger=INFO, stdlog
    log4j.appender.stdlog=org.apache.log4j.ConsoleAppender
    log4j.appender.stdlog.layout=org.apache.log4j.PatternLayout
    log4j.appender.stdlog.layout.ConversionPattern=%d{HH:mm:ss} %-5p %-25c{1} :: %m%n

    status = error
    name = PropertiesConfig
    filters = threshold
    filter.threshold.type = ThresholdFilter
    filter.threshold.level = INFO

    appender.console.type = Console
    appender.console.name = STDOUT
    appender.console.layout.type = PatternLayout
    appender.console.layout.pattern = %d{HH:mm:ss} %-5p %-15c{1} :: %m%n

    rootLogger.level                  = INFO
    rootLogger.appenderRef.stdout.ref = STDOUT

    # the query execution logger

    # Execution logging
    logger.arq-exec.name  = org.apache.jena.arq.exec
    logger.arq-exec.level = INFO

The command output will be similar to this one.

    00:05:20 INFO  exec                      :: QUERY
      SELECT  *
      WHERE
        { ?a ?b ?c }
    00:05:20 INFO  exec                      :: ALGEBRA
      (quadpattern (quad <urn:x-arq:DefaultGraphNode> ?a ?b ?c))
    00:05:20 INFO  exec                      :: TDB
      (quadpattern (quad <urn:x-arq:DefaultGraphNode> ?a ?b ?c))
    00:05:20 INFO  exec                      :: Execute :: (?a ?b ?c)

The logging operation can be expensive, so try to limit it when possible.

## Statistics Rule File

The syntax is `SSE`, a simple format that uses
[Turtle](http://www.w3.org/TeamSubmission/turtle/ "http://www.w3.org/TeamSubmission/turtle/")-syntax
for RDF terms, keywords for other terms (for example, the stats
marks a statistics data structure), and forms a tree data
structure.

The structure of a statistics file takes the form:

    (prefix ...
      (stats
        (meta ...)
        rule
        rule
       ))

that is, a `meta` block and a number of pattern rules.

A simple example:

    (prefix ((: <http://example/))
      (stats
        (meta
          (timestamp "2008-10-23T10:35:19.122+01:00"^^<http://www.w3.org/2001/XMLSchema#dateTime>)
          (run@ "2008/10/23 10:35:19")
          (count 11))
        (:p 7)
        (<http://example/q> 7)
      ))

This example statistics file contains some metadata about
statistics (time and date the file was generated, size of graph),
the frequence count for two predicates
`http://example/p` (written
using a prefixed name) and
`http://example/q` (written in
full).

The numbers are the estimated counts. They do not have to be exact
- they guide the optimizer in choosing one execution plan over
another. They do not have to exactly up-to-date providing the
relative counts are representative of the data.

### Statistics Rule Language

A rule is made up of a triple pattern and a count estimation for
the approximate number of matches that the pattern will yield. This
does have to be exact, only an indication.

In addition, the optimizer considers which variables will be bound
to RDF terms by the time a triplepatetrn is reached in the
execution plan being considered. For example, in the basic graph
pattern:

    { ?x  :identifier  1234 .
      ?x  :name        ?name .
    }

then ?x will be bound in pattern ?x :name ?name to an RDF term if
executed after the pattern ?x :identifier 1234.

A rule is of the form:

    ( (subj pred obj) count)

where *subj*, *pred*, *obj* are either RDF terms or one of the
tokens in the following table:

### Statistic rule tokens

Token | Description
TERM | Matches any RDF term (URI, Literal, Blank node)
VAR | Matches a named variable (e.g. ?x)
URI | Matches a URI
LITERAL | Matches an RDF literal
BNODE | Matches an RDF blank node (in the data)
ANY  |Matches anything - a term or variable

From the example above, `(VAR :identifier TERM)` will match
`?x :identifier 1234`.

`(TERM :name VAR)` will match `?x :name ?name` when in a potential plan
where the `:identifier` triple pattern is first because `?x` will be a
bound term at that point but not if this triple pattern is
considered first.

When searching for a weighting of a triple pattern, the first rule
to match is taken.

The rule which says an RDF graph is a set of triples:

    ((TERM TERM TERM) 1)

is always implicitly present.

BNODE does not match a blank node in the query (which is a variable
and matches VAR) but in the data, if it is known that slot of a
triple pattern is a blank node.

### Abbreviated Rule Form

While a complete rule is of the form:

    ( (subj pred obj) count)

there is an abbreviated form:

    (predicate count)

The abbreviated form is equivalent to writing:

    ((TERM predicate ANY) X)
    ((ANY predicate TERM) Y)
    ((ANY predicate ANY) count)

where for small graphs (less that 100 triples) X=2, Y=4 but Y=40 if
the predicate is rdf:type and 2, 10, 1000 for large graphs. Use of
"VAR rdf:type Class" can be a quite unselective triple pattern and
so there is a preference to move it later in the order of execution
to allow more selective patterns reduce the set of possibilities
first. The astute reader may notice that ontological information
may render it unnecessary (the domain or range of another property
implies the class of some resource). TDB does not currently perform
this optimization.

These number are merely convenient guesses and the application can
use the full rules language for detailed control of pattern
weightings.

### Defaults

A rule of the form:

    (other number)

is used when no matches from other rules (abbreviated or full) when
matching a triple pattern that has a URI in the predicate position.
If a rule of this form is absent, the default is to place the
triple pattern after all known triple patterns; this is the same as
specifying -1 as the number. To declare that the rules are complete
and no other predicates occur in the data, set this to 0 (zero)
because the triple pattern can not match the data (the predicate
does not occur).

## Generating a statistics file

The command line `tdbstats` will scan the data and produce a rules
file based on the frequency of properties. The output should first
go to a temporary file, then that file moved into the database
location.

Practical tip: Don't feed the output of this command directly to
*location*/stats.opt because when the command starts it will find
an empty statistics file at that location.

### Generating statistics for Union Graphs

By default `tdbstats` only processes the default graph of a dataset. However 
in some circumstances it is desirable to have the statistics generated 
over Named Graphs in the dataset.

The `tdb:unionDefaultGraph` option will cause TDB to synthesize a default 
graph for SPARQL queries, from the union of all Named Graphs in the 
dataset. 

Ideally the statistics file should be generated against this 
union graph. This can be achieved using the `--graph` option as follows:

     tdbstats --graph urn:x-arq:UnionGraph --loc /path/to/indexes

The `graph` parameter uses a built-in TDB [special graph name](/documentation/tdb/datasets.html#special-graph-names)

## Writing Rules

Rule for an inverse functional property:

    ((VAR :ifp TERM) 1 )

and even if a property is only approximately identifying for
resources (e.g. date of birth in a small dataset of people), it is
useful to indicate this. Because the counts needed are only
approximations so the optimizer can choose one order over another,
and does not need to predicate exact counts, rules that are usually
right but may be slightly wrong are still useful overall.

Rules involving rdf:type can be useful where they indicate whether
a particular class is common or not. In some datasets

    ((VAR rdf:type class) ...)

may help little because a property whose domain is that class, or a
subclass, may be more elective. SO a rule like:

    ((VAR :property VAR) ...)

is more selective.

In other datasets, there may be many classes, each with a small
number of instances, in which case

    ((VAR rdf:type class) ...)

is a useful selective rule.
