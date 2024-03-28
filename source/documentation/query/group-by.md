---
title: ARQ - Aggregates
---

ARQ includes support for GROUP BY and counting.  This was previously an ARQ extension but is now legal SPARQL 1.1

## GROUP BY

A `GROUP BY` clause transforms a result set so that only one row
will appear for each unique set of grouping variables. All other
variables from the query pattern are projected away and are not
available in the `SELECT` clause.

    PREFIX

    SELECT ?p ?q
    { . . .
    }
    GROUP BY ?p ?q

`SELECT *` will include variables from the `GROUP BY` but no
others. This ensures that results are always the same - including
other variables from the pattern would involve choosing some value
that was not constant across each section of the group and so lead
to indeterminate results.

The `GROUP BY` clause can involve an expression. If the expression
is named, then the value is included in the columns, before
projection. An unnamed expression is used for grouping but the
value is not placed in the result set formed by the `GROUP BY`
clause.

    SELECT ?productId ?cost
    { . . .
    }
    GROUP BY ?productId (?num * ?price AS ?cost)



## HAVING

A query may specify a HAVING clause to apply a filter to the result
set after grouping. The filter may involve variables from the
`GROUP BY` clause or aggregations.

    SELECT ?p ?q
    { . . .
    }
    GROUP BY ?p ?q
    HAVING (count(distinct *) > 1)

## Aggregation

Currently supported aggregations:

Aggregator | Description
---------- | -----------
`count(*)` | Count rows of each group element, or the whole result set if no `GROUP BY`.
`count(distinct *)` | Count the distinct rows of each group element, or the whole result set if no `GROUP BY`.
`count(?var)` | Count the number of times `?var` is bound in a group.
`count(distinct ?var)` | Count the number of distinct values `?var` is bound to in a group.
`sum(?x)` | Sum the variable over the group (non-numeric values and unbound values are ignored).

When a variable is used, what is being counted is occurrences of
RDF terms, that is names. It is not a count of individuals because
two names can refer to the same individual.

If there was no explicit `GROUP BY` clause, then it is as if the
whole of the result set forms a single group element.
Equivalently, it is `GROUP BY` of no variables. Only aggregation
expressions make sense in the SELECT clause as there are no
variables from the query pattern to project out.


[ARQ documentation index](index.html)
