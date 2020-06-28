---
title: Support of RDF*
slug: index
---
[RDF\*](https://arxiv.org/abs/1406.3399) is an extension to RDF that provides
a way for one triple to refer to another triple. Another resource about RDF\* is
[Olaf Hartig's blog entry](https://blog.liu.se/olafhartig/2019/01/10/position-statement-rdf-star-and-sparql-star/).

Example:

```turtle
<< :john foaf:name "John Smith" >> dct:source <http://example/directory> .
```

The part `<< :john foaf:name "John Smith" >>` is a triple term and refers to the triple with subject `:john`, property `foaf:name` and object `"John Smith"`.

Triple terms can be in the subject or object position.

Jena provides support for RDF\* and the related SPARQL\*.

Support for RDF* is experimentation in Jena 3.15.0 (released May 2020):

* Turtle, N-Triples, TriG and N-Quads extended for Triple Terms syntax.  There is no output in RDF/XML.
* SPARQL extended with Triple Term syntax for graph matching (in code, use `Syntax.syntaxARQ`).
* SPARQL Result formats for JSON and XML extended to support Triple Terms in results.
* Support in memory-based storage (graphs and datasets).
* Support in the Model API.

All this is active by default in Fuseki.

This support is experimental and subject to change. The aim is to follow the definition of RDF* as well as emerging _de facto_ consensus in other implementations.

Later releases will extend support to persistent storage in [TDB1](/documentation/tdb) and [TDB2](/documentation/tdb2/).

## RDF\*

RDF\* syntax for triple terms is added to the parsers for Turtle, N-Triples, TriG and N-Quads.

Datasets may have graphs that have triple terms that refer to triples anywhere, not just in the same graph.

## SPARQL\*

Matches for triple terms:

```sparql
SELECT ?name { <<:john foaf:name ?name >> dct:source <http://example/directory> }
```

Insert triples terms into the default graph to record the graph source.

```sparql
INSERT { <<?s ?p ?o>> dct:source <http://example/directory> }
WHERE {
    GRAPH <http://example/directory> {
        ?s ?p ?o
    }
}
```

### SPARQL Functions related to triple terms

These functions cause an expression error if passed the wrong type of arguments. `afn:`
is a prefix for `<http://jena.apache.org/ARQ/function#>`.

| Function | Description |
| -------- | ----------- |
| `afn:subject(?t)`        | Return the subject of the triple term              |
| `afn:predicate(?t)`      | Return the predicate (property) of the triple term |
| `afn:object(?t)`         | Return the object of the triple term               |
| `afn:triple(?s, ?p, ?o)` | Create a triple term from s/p/o                    |
| `afn:isTriple(?t)`       | Return true if the argument value is a triple term |

### SPARQL Property Functions related to triple terms

`apf:` is a prefix for `<http://jena.apache.org/ARQ/property#>`.

| Property Function | Description |
| -------- | ----------- |
| `<< s p o >> apf:find t` . | Match the triple term. Any `s`, `p`, `o`, and `t` can be RDF terms or variables.|

`apf:find` will result in all the variables being are set accorind to the match,
If `t` is a variable, `?t`, it is bound to a triple term for the match of `<<s p o>>`.

### SPARQL results

The syntaxes for SPARQL results from a SELECT query, `application/sparql-results+json`,
`application/sparql-results+xml` are extended to include triple terms:

The triple term `<< _:b0 <http://example/p> 123  >>` is encoded, in
`application/sparql-results+json` as:

```json
    {
      "type": "triple" ,
      "value": {
        "subject":   { "type": "bnode" , "value": "b0" } ,
        "property":  { "type": "uri" , "value": "http://example/p" } ,
        "object":    { "type": "literal" , "datatype": "http://www.w3.org/2001/XMLSchema#integer" , "value": "123" }
    }
```

and similarly in `application/sparql-results+xml`:

```xml
    <triple>
      <subject>
        <bnode>b0</bnode>
      </subject>
      <property>
        <uri>http://example/p</uri>
      </property>
      <object>
        <literal datatype="http://www.w3.org/2001/XMLSchema#integer">123</literal>
      </object>
    </triple>
```

## Model API

RDF* triple terms are treated as `Resource` to preserve the typed Model API.
They occur in the subject and object positions.

A `Resource` contains a `Statement` object if the underlying RDF term is a RDF* triple term.

New methods include:

* `Statement  Resource.getStatement()`
* `Resource  Model.createResource(Statement)`
* `Resource  ResourceFactory.createStatement`
