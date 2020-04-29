---
title: ARQ - Generate JSON from SPARQL
---

The current W3C recommendation of 
[SPARQL 1.1](http://www.w3.org/TR/sparql11-query/) supports the [query results in
JSON format](https://www.w3.org/TR/2013/REC-sparql11-results-json-20130321/). What is
described in this page is not that format, but an extension of Apache Jena, which allows
users to define how results should be returned in a key/value pair fashion, providing
this way a simpler output. This output can be easily used as model for web applications,
or inspecting data.

Compare the output of this extension:

    [
      {
        "book": "http://example.org/book/book6",
        "title": "Harry Potter and the Half-Blood Prince"
      },
      {
        "book": "http://example.org/book/book7",
        "title": "Harry Potter and the Deathly Hallows"
      },
    ]

With the output of the SPARQL 1.1 query result JSON format below:

    {
      "head": { "vars": [ "book" , "title" ]
      } ,
      "results": { 
        "bindings": [
          {
            "book": { "type": "uri" , "value": "http://example.org/book/book6" } ,
            "title": { "type": "literal" , "value": "Harry Potter and the Half-Blood Prince" }
          } ,
          {
            "book": { "type": "uri" , "value": "http://example.org/book/book7" } ,
            "title": { "type": "literal" , "value": "Harry Potter and the Deathly Hallows" }
          }
        ]
      }
    }

This feature was added in Jena 3.8.0.

## Query Syntax

The `JSON` syntax is similar in certain ways to the SPARQL `CONSTRUCT` syntax.

    PREFIX purl: <http://purl.org/dc/elements/1.1/>
    PREFIX w3: <http://www.w3.org/2001/vcard-rdf/3.0#> 
    PREFIX : <http://example.org/book/> 

    JSON {
      "author": ?author, 
      "title": ?title 
    }
    WHERE 
    {
      ?book purl:creator ?author .
      ?book purl:title ?title . 
      FILTER (?author = 'J.K. Rowling')
    }

As in `CONSTRUCT`, users are able to specify how the output must look like, using a simple
key/value pair pattern, which could produce the following output for the query above.

    [
      { 
        "author" : "J.K. Rowling" ,
        "title" : "Harry Potter and the Deathly Hallows"
      }
      { 
        "author" : "J.K. Rowling" ,
        "title" : "Harry Potter and the Philosopher's Stone"
      }
      { 
        "author" : "J.K. Rowling" ,
        "title" : "Harry Potter and the Order of the Phoenix"
      }
      { 
        "author" : "J.K. Rowling" ,
        "title" : "Harry Potter and the Half-Blood Prince"
      }
    ]

### Grammar

The normative definition of the syntax grammar of the query string is defined in this table:

Rule                      |     | Expression
--------------------------|-----|------------------------
JsonQuery                 | ::= | JsonClause ( DatasetClause )\* WhereClause SolutionModifier
JsonClause                | ::= | 'JSON' '\{' JsonObjectMember ( ',' JsonObjectMember )\* '\}'
JsonObjectMember          | ::= | String ':' ( Var &#x7C; RDFLiteral &#x7C; NumericLiteral &#x7C; BooleanLiteral )

`DatasetClause`, `WhereClause`, `SolutionModifier`, `String`, `Var`, 'RDFLiteral',
`NumericLiteral`, and 'BooleanLiteral' are as for the [SPARQL 1.1 Grammar](http://www.w3.org/TR/sparql11-query/#grammar)

## Programming API

ARQ provides 2 additional methods in [QueryExecution](/documentation/javadoc/arq/org/apache/jena/query/QueryExecution.html) for JSON.

    Iterator<JsonObject> QueryExecution.execJsonItems()
    JsonArray QueryExecution.execJson()

In order to use these methods, it's required to switch on the query syntax
of ARQ beforehand, when creating the `Query` object:
    
    Query query = QueryFactory.create(queryString, Syntax.syntaxARQ)
    String queryString = "JSON { 'name' : ?name, 'age' : ?age } WHERE ... "
    ...
    Iterator<JsonObject> json = qexec.execJsonItems()

## Fuseki Support

Users are able to use Fuseki web interface, as well as the other HTTP endpoints to submit
queries using any programming language. The following example shows how to POST to the query
endpoint passing the query as a form data field.

    curl -XPOST --data "query=JSON { 'name' : ?name, 'age': ?age } WHERE { ... }" http://localhost:3030/ds/query

The web interface editor parses the SPARQL implementation syntax, so syntax errors are expected
in the web editor at this moment when using the `JSON` clause. The query should still be correctly
executed, and the results displayed as with other normal SPARQL queries.

[ARQ documentation index](index.html)
