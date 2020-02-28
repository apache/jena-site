---
title: SPARQL Tutorial - A First SPARQL Query
---

In this section, we look at a simple first query and show how to
execute it with Jena.

## A "hello world" of queries

The file "[q1.rq](sparql_data/q1.rq)" contains the following query:

    SELECT ?x
    WHERE { ?x  <http://www.w3.org/2001/vcard-rdf/3.0#FN>  "John Smith" }

executing that query with the command line query application;

    ---------------------------------
    | x                             |
    =================================
    | <http://somewhere/JohnSmith/> |
    ---------------------------------

This works by matching the triple pattern in the `WHERE` clause
against the triples in the RDF graph. The predicate and object of
the triple are fixed values so the pattern is going to match only
triples with those values. The subject is a variable, and there are
no other restrictions on the variable. The pattern matches any
triples with these predicate and object values, and it matches with
solutions for `x`.

The item enclosed in <\> is a URI (actually, it's an IRI) and the
item enclosed in "" is a plain literal. Just like Turtle, N3 or
N-triples, typed literals are written with \^\^ and language tags
can be added with @.

?x is a variable called x. The ? does not form part of the name
which is why it does not appear in the table output.

There is one match. The query returns the match in the `x` query
variable. The output shown was obtained by using one of ARQ's
command line applications.

## Executing the query

There are [helper scripts](/documentation/query/cmds.html) in the Jena distribution `bat/` and
`bin/` directories.  You should check these scripts before use.  They can be placed on the shell
command path.

### Windows setup

Execute:

    bat\sparql.bat --data=doc\Tutorial\vc-db-1.rdf --query=doc\Tutorial\q1.rq

You can just put the `bat/` directory on your classpath or copy the
programs out of it.

### bash scripts for Linux/Cygwin/Unix

Execute:

    bin/sparql --data=doc/Tutorial/vc-db-1.rdf --query=doc/Tutorial/q1.rq

### Using the Java command line applications directly

(This is not necessary.)

You will need to set the classpath to include *all* the jar files
in the Jena distribution `lib/` directory.

    java -cp 'DIST/lib/*' arq.sparql ...

where `DIST` is the `apache-jena-VERSION` directory.

[Next: basic patterns](sparql_basic_patterns.html)



