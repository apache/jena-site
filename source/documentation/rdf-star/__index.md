---
title: Support of RDF-star
slug: index
aliases:
    - /docimentation/rdfstar/
    - /documentation/rdfstar/index.html
---
[RDF-star](https://w3c.github.io/rdf-star/) is an extension to RDF that provides
a way for one triple to refer to another triple. Another resource about RDF\* is
[Olaf Hartig's blog entry](https://blog.liu.se/olafhartig/2019/01/10/position-statement-rdf-star-and-sparql-star/).

Example:

```turtle
<< :john foaf:name "John Smith" >> dct:source <http://example/directory> .
```

The part `<< :john foaf:name "John Smith" >>` is an embedded triple and refers to the triple with subject `:john`, property `foaf:name` and object `"John Smith"`.

Triple terms can be in the subject or object position.

Jena provides support for RDF-star and the related SPARQL-star.

* Turtle, N-Triples, TriG and N-Quads extended for Triple Terms syntax.  There is no output in RDF/XML.
* SPARQL extended with Triple Term syntax for graph matching (in code, use `Syntax.syntaxARQ`).
* SPARQL Result formats for JSON and XML extended to support Triple Terms in results.
* Support in the Model API.

All this is active by default in Fuseki.

The aim is to follow the definition of the [RDF-star community](https://w3c.github.io/rdf-star/).

Storage in databases [TDB1](/documentation/tdb) and [TDB2](/documentation/tdb2/) is supported as of Jena 3.16.0.

## RDF-star

RDF-star syntax for embedded triples is added to the parsers for Turtle, N-Triples, TriG and N-Quads.

Datasets may have graphs that have embedded triples that refer to triples anywhere, not just in the same graph.

## SPARQL-star

Matches for embedded triples:

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

### SPARQL Functions related to embedded triples

These functions cause an expression error if passed the wrong type of arguments. `afn:`
is a prefix for `<http://jena.apache.org/ARQ/function#>`.

| Keyword            | Function                 | Description |
|--------------------| ------------------------ | ------------ |
| TRIPLE(?s, ?p, ?o) | `afn:triple(?s, ?p, ?o)` | Create an embedded triple from s/p/o                    |
| isTRIPLE(?t)       | `afn:isTriple(?t)`       | Return true if the argument value is an embedded triple |
| SUBJECT(?t)        | `afn:subject(?t)`        | Return the subject of the embedded triple              |
| PREDICATE(?t)      | `afn:predicate(?t)`      | Return the predicate (property) of the embedded triple |
| OBJECT(?t)         | `afn:object(?t)`         | Return the object of the embedded triple               |

### SPARQL results

The syntaxes for SPARQL results from a SELECT query, `application/sparql-results+json`,
`application/sparql-results+xml` are extended to include embedded triples:

The embedded triple `<< _:b0 <http://example/p> 123  >>` is encoded, in
`application/sparql-results+json` as:

```json
    {
      "type": "triple" ,
      "value": {
        "subject":    { "type": "bnode" , "value": "b0" } ,
        "predicate":  { "type": "uri" , "value": "http://example/p" } ,
        "object":     { "type": "literal" , "datatype": "http://www.w3.org/2001/XMLSchema#integer" , "value": "123" }
    }
```

and similarly in `application/sparql-results+xml`:

```xml
    <triple>
      <subject>
        <bnode>b0</bnode>
      </subject>
      <predicate>
        <uri>http://example/p</uri>
      </predicate>
      <object>
        <literal datatype="http://www.w3.org/2001/XMLSchema#integer">123</literal>
      </object>
    </triple>
```

## Model API

RDF-star embedded triples are treated as `Resource` to preserve the typed Model API.
They occur in the subject and object positions.

A `Resource` contains a `Statement` object if the underlying RDF term is an RDF* embedded triple.

New methods include:

* `Statement  Resource.getStatement()`
* `Resource  Model.createResource(Statement)`
* `Resource  ResourceFactory.createStatement`
