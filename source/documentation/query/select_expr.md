---
title: ARQ - SELECT Expressions
---

The SELECT statement of a query can include expressions, not just
variables.  This was previously a SPARQL extension but is now legal SPARQL 1.1

Expressions are enclosed in `()` and can be optionally named using
`AS`. If no name is given, and internal name is allocated which may
not be a legal SPARQL variable name. In order to make results
portable in the
[SPARQL Query Results XML Format](http://www.w3.org/TR/rdf-sparql-XMLres/),
the application must specify the name so using `AS` is strongly
encouraged.

Expressions can involve [group aggregations](group-by.html).

Expressions that do not correctly evaluate result in an unbound
variable in the results. That is, the illegal expression is
silently skipped.

Examples:

    PREFIX : <http://example/>

    SELECT (?p+1 AS ?q)
    {
      :x :p ?p
    }



    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX :    <http://example/>

    SELECT (count(*) AS ?count)
    {
      :x rdf:type :Class
    }


[ARQ documentation index](index.html)
