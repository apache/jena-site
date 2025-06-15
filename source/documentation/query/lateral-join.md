---
title: ARQ - Lateral Join
---

Lateral joins using the keyword `LATERAL` were introduced in Apache Jena 4.7.0.

A `LATERAL` join is like a foreach loop, looping on the results from the
left-hand side (LHS), the pattern before the `LATERAL` keyword, and executing
the right-hand side (RHS) query pattern once for each row, with the variables
from the input LHS in-scope during each RHS evaluation.

A regular join only executes the RHS once, and the variables from the LHS are
used for the join condition after evaluation of the left and right
sub-patterns.

Another way to think of a lateral join is as a `flatmap`.

Examples:

```sparql
## Get exactly one label for each subject with type `:T`
SELECT * {
  ?s rdf:type :T
  LATERAL {
    SELECT * { ?s rdfs:label ?label } LIMIT 1
  }
}
```

```sparql
## Get zero or one labels for each subject.
SELECT * {
  ?s ?p ?o
  LATERAL {
    OPTIONAL {
      SELECT * { ?s rdfs:label ?label } LIMIT 1
    }
  }
}
```

#### Syntax

The `LATERAL` keyword which takes the graph pattern so far in the group, from
the `{` starting of the current block, and a `{ }` block afterwards.

#### Evaluation

[Substituting variables](https://afs.github.io/substitute.html) from the LHS into the RHS (with the same restrictions), then executing the pattern, gives the evaluation of `LATERAL`.

#### Variable assignment

There needs to be a new syntax restriction: there can no variable introduced by
`AS` (`BIND`, or sub-query) or `VALUES` in-scope at the top level of the
`LATERAL` RHS, that is the same name as any
[in-scope](https://www.w3.org/TR/sparql11-query/#variableScope) variable from
the LHS.

Such a variable assignment would conflict with the variable being set in
variables of the row being joined.

```sparql
## ** Illegal **
SELECT * {
  ?s ?p ?o
  LATERAL { BIND( 123 AS ?o) }
}
```

See [SPARQL Grammar note 12](https://www.w3.org/TR/sparql11-query/#sparqlGrammar).

In ARQ, [LET](assignment.html) would work.
`LET` for a variable that is bound acts like a filter.

#### Variable Scopes

In looping on the input, a lateral join makes the bindings of variables in the current row
available to the right-hand side pattern, setting their value from the top down.

In SPARQL, it is possible to have variables of the same name which are not
exposed within a sub-select. These are not lateral-joined to a variable of the
same name from the LHS.

This is not specific to lateral joins. In

```sparql
SELECT * {
  ?s rdf:type :T 
  {
    SELECT ?label { ?s rdfs:label ?label }
  }
}
```
the inner `?s` can be replaced by `?z` without changing the results because the
inner `?s` is not joined to the outer `?s` but instead is hidden by the `SELECT ?label`.

```sparql
SELECT * {
  ?s rdf:type :T 
  {
    SELECT ?label { ?z rdfs:label ?label }
  }
}
```

The same rule applies to lateral joins.

```sparql
SELECT * {
  ?s rdf:type :T 
  LATERAL {
    SELECT ?label { ?s rdfs:label ?label } LIMIT 1
  }
}
```

The inner `?s` in the `SELECT ?label` is not the outer `?s` because the `SELECT
?label` does not pass out `?s`. As a sub-query the `?s` could be any name except
`?label` for the same results.

### Notes

There is a similarity to filter `NOT EXISTS`/`EXISTS` expressed as the non-legal
`FILTER ( ASK { pattern } )` where the variables of the row being filtered are
available to "pattern". This is similar to an SQL
[correlated subquery](https://en.wikipedia.org/wiki/Correlated_subquery).

## SPARQL Specification Additional Material

### Syntax

`LATERAL` is added to the SPARQL grammar at rule `[[56] GraphPatternNotTriples](https://www.w3.org/TR/sparql11-query/#rGraphPatternNotTriples)`. As a syntax form, it is similar to `OPTIONAL`.

<div class="font-monospace">

ID     | Rule                     |     | Expression
-------|--------------------------|-----|------------------------
[56]   | GraphPatternNotTriples   | ::= | GroupOrUnionGraphPattern | OptionalGraphPattern | LateralGraphPattern | ...
[57]   | OptionalGraphPattern     | ::= | 'OPTIONAL' GroupGraphPattern
[  ]   | LateralGraphPattern      | ::= | 'LATERAL' GroupGraphPattern

</div>

### Algebra

The new algebra operator is `lateral` which takes two expressions

```sparql
SELECT * {
  ?s  ?p  ?o
  LATERAL
  { ?a  ?b  ?c }
}
```
is translated to:

```lisp
(lateral
  (bgp (triple ?s ?p ?o))
  (bgp (triple ?a ?b ?c)))
```

### Evaluation

To evaluate `lateral`:

* Evaluate the first argument (left-hand side from syntax) to get a multiset of solution mappings.
* For each solution mapping ("row"),
    - inject variable bindings into the second argument
    - Evaluate this pattern
    - Add to results

Outline:

```
Definition: Lateral

Let Ω be a multiset of solution mappings. We define:

Lateral(Ω, P) = { μ | union of Ω1 where 
           foreach μ1 in Ω:
               pattern2 = inject(pattern, μ1)
               Ω1 = eval(D(G), pattern2)
         result Ω1
     }
```
where `inject` is the [corrected `substitute`](https://afs.github.io/substitute.html) 
operation.

An alternative style is to define Lateral more like "evaluate P such that μ is
in-scope" in some way, rather than rely on `inject` which is a mechanism.

```
Definition: Evaluation of Lateral

eval(D(G), Lateral(P1, P2) = Lateral(eval(D(G), P1), P2)
```
