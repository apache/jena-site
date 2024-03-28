---
title: Jena Query Builder - A query builder for Jena.
slug: index
---

## Overview

Query Builder provides implementations of Ask, Construct, Select and Update builders that allow developers to create queries without resorting to StringBuilders or similar solutions.  The Query Builder module is an extra package and is found in the `jena-querybuilder` jar.

Each of the builders has a series of methods to define the query.  Each method returns the builder for easy chaining.  The  example:

```java
SelectBuilder sb = new SelectBuilder()
    .addVar( "*" )
    .addWhere( "?s", "?p", "?o" );

Query q = sb.build() ;
```

produces

```sparql
SELECT *
WHERE
  { ?s ?p ?o }
```

Standard Java variables can be used in the various clauses as long as the datatype has a registered Datatype within Jena.  For example:

```java
Integer five = Integer.valueof(5);
SelectBuilder sb = new SelectBuilder()
    .addVar( "*" )
    .addWhere( "?s", "?p", five );

Query q = sb.build() ;
```

produces

```sparql
SELECT *
WHERE
  { ?s ?p "5"^^<http://www.w3.org/2001/XMLSchema#integer> }
```

Java Collections are properly expanded to RDF collections within the query builder provided there is a registered Datatype for the elements.  Nested collections are expanded. Collections can also be defined with the standard SPARQL shorthand.  So the following produce equivalent queries:

```java
SelectBuilder sb = new SelectBuilder()
    .addVar( "*" )
    .addWhere( "?s", "?p", List.of( "a", "b", "c") );

Query q = sb.build() ;
```

and

```java
SelectBuilder sb = new SelectBuilder()
    .addVar( "*" )
    .addWhere( "?s", "?p", "('a' 'b' 'c')" );

Query q = sb.build() ;
```

It is common to create `Var` objects and use them in complex queries to make the query more readable.  For example:

```java
Var node = Var.alloc("node");
Var x = Var.alloc("x");
Var y = Var.alloc("y");
SelectBuilder sb = new SelectBuilder()
  .addVar(x).addVar(y)
  .addWhere(node, RDF.type, Namespace.Obst)
  .addWhere(node, Namespace.x, x)
  .addWhere(node, Namespace.y, y);
```

# Constructing Expressions

Expressions are primarily used in `filter` and `bind` statements as well as in select clauses.  All the standard expressions are implemented in the `ExprFactory` class.  An `ExprFactory` can be retrieved from any Builder by calling the `getExprFactory()` method.  This will create a Factory that has the same prefix mappings and the query.  An alternative is to construct the `ExprFactory` directly, this factory will not have the prefixes defined in `PrefixMapping.Extended`.

```java
SelectBuilder builder = new SelectBuilder();
ExprFactory exprF = builder.getExprFactory()
    .addPrefix( "cf",
        "http://vocab.nerc.ac.uk/collection/P07/current/CFSN0023/");
builder.addVar( exprF.floor( ?v ), ?floor )
    .addWhere( ?s, "cf:air_temperature", ?v );
```


## Update Builder

The `UpdateBuilder` is used to create `Update`, `UpdateDeleteWhere` or `UpdateRequest` objects.  When an `UpdateRequest` is built is contains a single `Update` object as defined by the `UpdateBuilder`.  `Update` objects can  be added to an UpdateRequest using the `appendTo()` method.

```java
Var subj = Var.alloc( "s" );
Var obj = Var.alloc( "o" );

UpdateBuilder builder = new UpdateBuilder( PrefixMapping.Standard)
    .addInsert( subj, "rdfs:comment", obj )
    .addWhere( subj, "dc:title", obj);

UpdateRequest req = builder.buildRequest();

UpdateBuilder builder2 = new UpdateBuilder()
    .addPrefix( "dc", "http://purl.org/dc/elements/1.1/")
    .addDelete( subj, "?p", obj)
    .where( subj, dc:creator, "me")
    .appendTo( req );
```

## Where Builder

In some use cases it is desirable to create a where clause without constructing an entire query.  The `WhereBuilder` is designed to fit this need.  For example to construct the query:

```sparql
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX foaf: <http://xmlns.com/foaf/0.1/>

SELECT ?page ?type WHERE
{
    ?s foaf:page ?page .
    { ?s rdfs:label "Microsoft"@en . BIND ("A" as ?type) }
    UNION
    { ?s rdfs:label "Apple"@en . BIND ("B" as ?type) }
}
```

You could use a WhereBuilder to construct the union queries and add them to a Select or other query builder.

```java
WhereBuilder whereBuilder = new WhereBuilder()
    .addPrefix( "rdfs",  "http://www.w3.org/2000/01/rdf-schema#" )
    addWhere( "?s", "rdfs:label", "'Microsoft'@en" )
    .addBind( "'A'", "?type")
    .addUnion( new WhereBuilder()
        .addPrefix( "rdfs",  "http://www.w3.org/2000/01/rdf-schema#" )
        .addWhere( "?s", "rdfs:label", "'Apple'@en" )
        .addBind( "'B'", "?type")
    );

SelectBuilder builder = new SelectBuilder()
   .addPrefix( "rdfs",  "http://www.w3.org/2000/01/rdf-schema#" )
   .addPrefix( "foaf", "http://xmlns.com/foaf/0.1/" );
   .addVar( "?page")
   .addVar( "?type" )
   .addWhere( "?s", "foaf:page",  "?page" )
   .addWhere( whereBuilder );
```

The where clauses could be built inline as:

```java
SelectBuilder builder = new SelectBuilder()
  .addPrefixs( PrefixMapping.Standard )
  .addPrefix( "foaf", "http://xmlns.com/foaf/0.1/" );
  .addVar( "?page")
  .addVar( "?type" )
  .addWhere( "?s", "foaf:page",  "?page" )
  .addWhere( new WhereBuilder()
      .addPrefix( "rdfs",  "http://www.w3.org/2000/01/rdf-schema#" )
      .addWhere( "?s", "rdfs:label", "'Microsoft'@en" )
      .addBind( "'A'", "?type")
      .addUnion( new WhereBuilder()
          .addPrefix( "rdfs",  "http://www.w3.org/2000/01/rdf-schema#" )
          .addWhere( "?s", "rdfs:label", "'Apple'@en" )
          .addBind( "'B'", "?type")
      )
  );
```

## Template Usage

In addition to making it easier to build valid queries the QueryBuilder has a clone method.
Using this a developer can create as "Template" query and add to it as necessary.

For example using the above query as the "template" with this code:

```java
SelectBuilder sb2 = sb.clone();
sb2.addPrefix( "foaf", "http://xmlns.com/foaf/0.1/" )
   .addWhere( ?s, RDF.type, "foaf:Person") ;
```

produces

```sparql
PREFIX foaf: <http://xmlns.com/foaf/0.1/>
SELECT *
WHERE
  { ?s ?p ?o .
    ?s <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> foaf:person .
  }
```

## Prepared Statement Usage

The query builders have the ability to replace variables with other values.  This can be

```java
SelectBuilder sb = new SelectBuilder()
    .addVar( "*" )
    .addWhere( "?s", "?p", "?o" );

sb.setVar( Var.alloc( "?o" ), NodeFactory.createURI( "http://xmlns.com/foaf/0.1/Person" ) ) ;
Query q = sb.build();
```

produces

```sparql
SELECT *
WHERE
  { ?s ?p <http://xmlns.com/foaf/0.1/Person> }
```
