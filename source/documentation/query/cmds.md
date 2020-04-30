---
title: ARQ - Command Line Applications
---

The `arq` package contains some command line applications to run
queries, parse queries, process result sets and run test sets.

You will need to set the classpath, or use the helper scripts, to
run these applications from the command line. The helper scripts
are in `bin/` (Linux, Unix, Cygwin, OS/X) and `bat/` (Windows)
directories. There are ancillary scripts in the directories that
the main commands need - see [the tools page](../tools/index.html)
for setup details.

-   [`arq.query`](#arqquery) is the main query driver.

-   [`arq.qparse`](#arqqparse) : parse and print a
    SPARQL query.

-   [`arq.uparse`](#arquparse) : parse and print a
    SPARQL update.

-   [`arq.update`](#arqupdate) : execute SPARQL/Update
    requests.

-   [`arq.remote`](#arqremote) : execute a query by
    HTTP on a remote SPARQL endpoint.

-   [`arq.rset`](#arqrset) : transform result sets.

-   [`arq.qexpr`](#arqqexpr) : evaluate and print an
    expression.

All commands have a `--help` command for a summary of the
arguments.

When using a query in a file, if the query file ends .rq, it is
assumed to be a SPARQL query. If it ends .arq, it is assumed to be
an ARQ query (extensions to SPARQL). You can specify the syntax
explicitly.

### `arq.query`

This is the main command for executing queries on data. The
wrappers just set the query language.

-   `arq.sparql` : wrapper for SPARQL queries
-   `arq.arq` : wrapper for ARQ queries

Running `arq.query --help`prints the usage message. The main
arguments are:

-   `--query FILE` : The file with the query to execute
-   `--data FILE` : The data to query. It will be included in the
    default graph.
-   `--namedgraph FILE` : The data to query. It will be included as
    a named graph.
-   `--desc/--dataset`:
    [Jena Assembler description](../assembler/) of the
    dataset to be queried, augmented with vocabulary for datasets, not
    just graphs. See `etc/` for examples.

The file extension is used to guess the file serialization format.
If a data file ends `.n3`, it is assumed to be N3; if it ends
`.ttl` is Turtle; if it is `.nt` is N-Triples; otherwise it is
assumed to be RDF/XML. The data serialization can be explicitly
specified on the command line.

### `arq.qparse`

Parse a query and print it out.

`arq.qparse` will parse the query, print it out again (with line
numbers by default) and then parse the serialized query again. If
your query has a syntax error, a message is printed but no query is
printed. If a query is printed then you get a syntax error message,
then your query was syntactically correct but the ARQ serialization
is broken.  Please report this.

The command `arq.qparse --print=op --file <i>queryFile</i>`will
print the SPARQL algebra for the query in
[SSE format](../notes/sse.html).

### `arq.uparse`

Parse a SPARQL update print it out.

`arq.uparse` will parse the update, print it out again (with line
numbers by default) and then parse the serialized update again. If
your update has a syntax error, a message is printed but no update is
printed. If a update is printed then you get a syntax error message,
then your query was syntactically correct but the ARQ serialization
is broken.  Please report this.

### `arq.update`

Execute [SPARQL Update](http://www.w3.org/TR/sparql11-update/)
requests.

-   `--desc`:
    [Jena Assembler description](../assembler/) of the
    dataset or graph store to be updated. See `etc/` for examples.

### `arq.rset`

Read and write result sets.

In particular,

    java -cp ... arq.rset --in xml --out text

will translate a SPARQL XML Result Set into a tabular text form.

### `arq.qexpr`

Read and print an expression (something that can go in a `FILTER`
clause). Indicates whether an evaluation exception occurred.

The `-v` argument prints the parsed expression.

### `arq.remote`

Execute a request on a remote SPARQL endpoint using HTTP.

-   `--service URL` : The endpoint.
-   `--data FILE` : Dataset description (default graph) added to
    the request.
-   `--namedgraph FILE` : Dataset description (named graph) added
    to the request.
-   `--results FORMAT` : Write results in specified format. Does
    not change the request to the server which is always for an XML
    form.
