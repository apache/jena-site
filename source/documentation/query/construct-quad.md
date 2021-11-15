---
title: ARQ - Construct Quad
---

The current W3C recommendation of 
[SPARQL 1.1](http://www.w3.org/TR/sparql11-query/) supports the [CONSTRUCT query
form](http://www.w3.org/TR/sparql11-query/#construct), which returns a single RDF graph specified by a graph template.  The
result is an RDF graph formed by taking each query solution in the solution
sequence, substituting for the variables in the graph template, and
combining the triples into a single RDF graph by set union.  However, it
does not directly generate quads or 
[RDF datasets](http://www.w3.org/TR/sparql11-query/#rdfDataset).  
In order to
eliminate this limitation, Jena ARQ extends the grammar of the `CONSTRUCT`
query form and provides the according components, which brings more
conveniences for the users manipulating RDF datasets with SPARQL.

This feature was added in Jena 3.0.1.

## Query Syntax

A `CONSTRUCT` template of the SPARQL 1.1 query String is
[Turtle](http://www.w3.org/TR/turtle/) format with possible variables.  The
syntax for this extension follows that style in ARQ, using
[TriG](http://www.w3.org/TR/trig/) plus variables.  Just like SPARQL 1.1,
there are 2 forms for ARQ Construct Quad query:

### Complete Form

    CONSTRUCT {
        # Named graph
        GRAPH :g { ?s :p ?o }
        # Default graph
        { ?s :p ?o }
        # Default graph
        :s ?p :o
    } WHERE { 
        # SPARQL 1.1 WHERE Clause
        ... 
    }

The default graphs and the named graphs can be constructed within the
`CONSTRUCT` clause in the above way.  Note that, for constructing the named
graph, the token of `GRAPH` can be optional.  The brackets of the triples to
be constructed in the default graph can also be optional.

### Short Form

    CONSTRUCT WHERE { 
        # Basic dataset pattern (only the default graph and the named graphs)
        ... 
    }

A short form is provided for the case where the template and the pattern
are the same and the pattern is just a basic dataset pattern (no `FILTER`s
and no complex graph patterns are allowed in the short form). The keyword
`WHERE` is required in the short form.

### Grammar

The normative definition of the syntax grammar of the query string is defined in this table:

Rule                      |     | Expression
--------------------------|-----|------------------------
ConstructQuery            | ::= | 'CONSTRUCT' ( ConstructTemplate DatasetClause\* WhereClause SolutionModifier &#x7C; DatasetClause\* 'WHERE'  '\{' ConstructQuads '\}' SolutionModifier )
ConstructTemplate         | ::= | '\{' ConstructQuads '\}'
ConstructQuads            | ::= | TriplesTemplate? ( ConstructQuadsNotTriples '.'? TriplesTemplate? )\*
ConstructQuadsNotTriples  | ::= | ( 'GRAPH'  VarOrBlankNodeIri )? '\{' TriplesTemplate? '\}'
TriplesTemplate           | ::= | TriplesSameSubject ( '.' TriplesTemplate? )?

`DatasetClause`, `WhereClause`, `SolutionModifier`, `TriplesTemplate`, `VarOrIri`,
`TriplesSameSubject` are as for the [SPARQL 1.1 Grammar](http://www.w3.org/TR/sparql11-query/#grammar)

## Programming API

ARQ provides 2 additional methods in [QueryExecution](/documentation/javadoc/arq/org/apache/jena/query/QueryExecution.html) for Construct Quad.

    Iterator<Quad> QueryExecution.execConstructQuads() // allow duplication
    Dataset QueryExecution.execConstructDataset() // no duplication

One difference of the 2 methods is: 
The method of `execConstructQuads()` returns an `Iterator` of `Quad`, allowing duplication.
But `execConstructDataset()` constructs the desired Dataset object with only unique `Quad`s.

In order to use these methods, it's required to switch on the query syntax
of ARQ beforehand, when creating the `Query` object:
    
    Query query = QueryFactory.create(queryString, Syntax.syntaxARQ);

If the query is supposed to construct only triples, not quads, the triples
will be constructed in the default graph. For example:

    String queryString = "CONSTRUCT { ?s ?p ?o } WHERE ... "
    ...
    // The graph node of the quads are the default graph (ARQ uses <urn:x-arq:DefaultGraphNode>).
    Iterator<Quad> quads = qexec.execConstructQuads(); 

If the query string stands for constructing quads while the method of
`exeConstructTriples()` are called, it returns only the triples in the
default graph of the `CONSTRUCT` query template. It's called a "projection"
on the default graph. For instance:

    String queryString = "CONSTRUCT { ?s ?p ?o . GRAPH ?g1 { ?s1 ?p1 ?o1 } } WHERE ..."
    ...
    // The part of "GRAPH ?g1 { ?s1 ?p1 ?o1 }" will be ignored. Only "?s ?p ?o" in the default graph will be returned.
    Iterator<Triple> triples = qexec.execConstructTriples();

More examples can be found at `ExampleConstructQuads.java` at
[jena-examples:arq/examples/constructquads/](https://github.com/apache/jena/tree/main/jena-examples/src/main/java/arq/examples/constructquads/).

## Fuseki Support

Jena [Fuseki](/documentation/fuseki2/index.html) is also empowered with Construct Quad query as a built-in
function. No more additional configuration is required to switch it on.
Because
[QueryEngineHTTP](/documentation/javadoc/arq/org/apache/jena/sparql/engine/http/QueryEngineHTTP.html)
is just an implementation of QueryExecution, there's not much difference
for the client users to manipulate the programming API described in the
previous sections, e.g.

    String queryString = " CONSTRUCT { GRAPH <http://example/ns#g1> {?s ?p ?o} } WHERE {?s ?p ?o}" ;
    Query query = QueryFactory.create(queryString, Syntax.syntaxARQ);
    try ( QueryExecution qExec = QueryExecution.service(serviceQuery).query(query).build() ) { // serviceQuery is the URL of the remote service
        Iterator<Quad> result = qExec.execConstructQuads();
        ...
    }
    ...

[ARQ documentation index](index.html)
