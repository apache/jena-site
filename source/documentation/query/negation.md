---
title: ARQ - Negation
---

### Negation by Failure (OPTIONAL + !BOUND)

Standard SPARQL 1.0 can perform negation using the idiom of
`OPTIONAL`/`!BOUND`. It is inconvenient and can be hard to use as
complexity increases. SPARQL 1.1 supports additional operators for
negation.

    # Names of people who have not stated that they know anyone
    PREFIX foaf: <http://xmlns.com/foaf/0.1/>
    SELECT ?name
    WHERE
    { 
      ?x foaf:givenName  ?name .
      OPTIONAL { ?x foaf:knows ?who } .
      FILTER (!BOUND(?who))
    }

### EXISTS and NOT EXISTS

The `EXISTS` and `NOT EXISTS` are now legal SPARQL 1.1 when used inside a `FILTER`, 
they may be used as bare graph patterns only when `Syntax.syntaxARQ` is used

There is the `NOT EXISTS` operator which acts at the point in the query where it is
written. It does not bind any variables but variables already bound
in the query will have their bound value.

    # Names of people who have not stated that they know anyone
    PREFIX foaf: <http://xmlns.com/foaf/0.1/>
    SELECT ?name
    WHERE 
    {
      ?x foaf:givenName ?name .
      FILTER NOT EXISTS { ?x foaf:knows ?who }
    }

There is also an `EXISTS` operator.

    # Names of people where it is stated that they know at least one other person.
    PREFIX foaf: <http://xmlns.com/foaf/0.1/>
    SELECT ?name
    WHERE 
    {
      ?x foaf:givenName ?name .
      FILTER EXISTS { ?x foaf:knows ?who . FILTER(?who != ?x) }
    }


In this example, the pattern is a little more complex. Any graph
pattern is allowed although use of `OPTIONAL` is pointless (which
will always match, possible with no additional results).

`NOT EXISTS` and `EXISTS` can also be used in `FILTER` expressions.
In SPARQL, `FILTER` expressions act over the whole of the basic
graph pattern in which they occur.

    # Names of people who have not stated that they know anyone
    PREFIX foaf: <http://xmlns.com/foaf/0.1/>
    SELECT ?name
    WHERE 
    {
      ?x foaf:givenName ?name .
      FILTER (NOT EXISTS { ?x foaf:knows ?who })
     }

A note of caution:

    PREFIX foaf: <http://xmlns.com/foaf/0.1/>
    SELECT ?name
    WHERE 
    {
      ?x foaf:givenName ?name .
      FILTER (NOT EXISTS { ?x foaf:knows ?y })
      ?x foaf:knows ?who
    }

is the same as (it's a single basic graph pattern - the filter does
not break it in two):

    PREFIX foaf: <http://xmlns.com/foaf/0.1/>
    SELECT ?name
    WHERE 
    {
      ?x foaf:givenName ?name .
      ?x foaf:knows ?y .
      FILTER (NOT EXISTS { ?x foaf:knows ?who })
    }

and the `FILTER` will always be false (`{ ?x foaf:knows ?y }` must
have matched to get to this point in the query and using `?who`
instead makes no difference).

### MINUS

SPARQL 1.1 also provides a `MINUS` keyword which is broadly similar to
`NOT EXISTS` though does have some key differences as explained in the [specification](http://www.w3.org/TR/sparql11-query/#neg-notexists-minus):

    PREFIX foaf: <http://xmlns.com/foaf/0.1/>
    SELECT ?name
    WHERE
    {
      ?x foaf:givenName ?name .
      ?x foaf:knows ?y .
      MINUS { ?x foaf:knows <http://example.org/A> }
    }

Here we subtract any solutions where `?x` also knows `http://example.org/A`

One of the key differences between `MINUS` and `NOT EXISTS` is that it is a child graph pattern and so breaks 
the graph pattern and so the result of the query can change depending where the `MINUS` is placed.  This is 
unlike the earlier `NOT EXISTS` examples where moving the position of the `FILTER` resulted
in equivalent queries.

### NOT IN

SPARQL 1.1 also has a simpler form of negation for when you simply 
need to restrict a variable to not being in a given set of values, this is the
`NOT IN` function:

    PREFIX foaf: <http://xmlns.com/foaf/0.1/>
    SELECT ?name
    WHERE
    {
      ?x foaf:givenName ?name .
      ?x foaf:knows ?y .
      FILTER(?y NOT IN (<http://example.org/A>, <http://example.org/B>))
    }

This would filter out matches where the value of `?y` is either `http://example.org/A` or `http://example.org/B` 


[ARQ documentation index](index.html)
