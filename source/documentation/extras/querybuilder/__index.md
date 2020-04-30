---
title: Jena Query Builder - A query builder for Jena.
slug: index
---


# Table of Contents

{% toc %}

# Overview

Query Builder provides implementations of Ask, Construct, Select and Update builders that allow developers to create queries without resorting to StringBuilders or similar solutions.  The Query Builder module is an extra package and is found in the `jena-querybuilder` jar. 

Each of the builders has a series of methods to define the query.  Each method returns the builder for easy chaining.  The  example:


    SelectBuilder sb = new SelectBuilder()
        .addVar( "*" )
        .addWhere( "?s", "?p", "?o" );

    Query q = sb.build() ;


produces

    SELECT *
    WHERE
      { ?s ?p ?o }

# Constructing Expressions

Expressions are primarily used in `filter` and `bind` statements as well as in select clauses.  All the standard expressions are implemented in the `ExprFactory` class.  An `ExprFactory` can be retrieved from any Builder by calling the `getExprFactory()` method.  This will create a Factory that has the same prefix mappings and the query.  An alternative is to construct the `ExprFactory` directly, this factory will not have the prefixes defined in `PrefixMapping.Extended`.

    SelectBuilder builder = new SelectBuilder();
    ExprFactory exprF = builder.getExprFactory()
        .addPrefix( "cf",
            "http://vocab.nerc.ac.uk/collection/P07/current/CFSN0023/")
    builder.addVar( exprF.floor( ?v ), ?floor )

        .addWhere( ?s, "cf:air_temperature", ?v )


# Update Builder

The `UpdateBuilder` is used to create `Update`, `UpdateDeleteWhere` or `UpdateRequest` objects.  When an `UpdateRequest` is built is contains a single `Update` object as defined by the `UpdateBuilder`.  `Update` objects can  be added to an UpdateRequest using the `appendTo()` method.

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

# Where Builder

In some use cases it is desirable to create a where clause without constructing an entire query.  The `WhereBuilder` is designed to fit this need.  For example to construct the query:

    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX foaf: <http://xmlns.com/foaf/0.1/>

    SELECT ?page ?type WHERE
    {
        ?s foaf:page ?page .
        { ?s rdfs:label "Microsoft"@en . BIND ("A" as ?type) }
        UNION
        { ?s rdfs:label "Apple"@en . BIND ("B" as ?type) }
    }

You could use a WhereBuilder to construct the union queries and add them to a Select or other query builder.

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

The where clauses could be built inline as:

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



# Template Usage

In addition to making it easier to build valid queries the QueryBuilder has a clone method.
Using this a developer can create as "Template" query and add to it as necessary.

For example using the above query as the "template" with this code:


    SelectBuilder sb2 = sb.clone();
    sb2.addPrefix( "foaf", "http://xmlns.com/foaf/0.1/" )
       .addWhere( ?s, RDF.type, "foaf:Person") ;


produces

    PREFIX foaf: <http://xmlns.com/foaf/0.1/>
    SELECT *
    WHERE
      { ?s ?p ?o .
        ?s <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> foaf:person .
      }

# Prepared Statement Usage

The query builders have the ability to replace variables with other values.  This can be

    SelectBuilder sb = new SelectBuilder()
        .addVar( "*" )
        .addWhere( "?s", "?p", "?o" );

    sb.setVar( Var.alloc( "?o" ), NodeFactory.createURI( "http://xmlns.com/foaf/0.1/Person" ) ) ;
    Query q = sb.build();

produces

    SELECT *
    WHERE
      { ?s ?p <http://xmlns.com/foaf/0.1/Person> }
