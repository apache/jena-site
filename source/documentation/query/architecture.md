---
title: ARQ - Internal Design
---

@@ Incomplete / misnamed?

ARQ consists of the following parts:

-   The SPARQL abstract syntax tree (AST) and the SPARQL parser
-   The algebra generator that turns SPARQL AST into algebra
    expressions
    -   Implementation of the translation in the SPARQL specification.
    -   Quad version compiling SPARQL to quad expressions, not basic
        graph patterns.

-   Query engines to execute queries
    -   SPARQL protocol client - remote HTTP requests
    -   Reference engine - direct implementation of the algebra
    -   Quad engine - direct implementation of the algebra except
    -   The main engine
    -   TDB, a SPARQL database for large-sale persistent data

-   Result set handling for the SPARQL XML results format, the
    [JSON](http://json.org) and text versions.

## Main packages

Package | Use
------- | ---
`org.apache.jena.query` | The application API
`org.apache.jena.sparql.syntax` | Abstract syntax tree
`org.apache.jena.sparql.algebra`| SPARQL algebra
`org.apache.jena.sparql.lang` | The parsers: SPARQL, ARQ, RDQL
`org.apache.jena.sparql.expr` | Expression code.
`org.apache.jena.sparql.serializer` | Output in SPARQL, ARQ forms, in SPARQL syntax, in an abstract form (useful in debugging) and in XML.
`org.apache.jena.sparql.engine` | The abstraction of a query engine.
`org.apache.jena.sparql.engine.main` | The usual query engine.
`org.apache.jena.sparql.engine.ref` | The reference query engine (and quad version)

## Key Execution Classes

### Bindings

### Query Iterators

### Context

[ARQ documentation index](index.html)
