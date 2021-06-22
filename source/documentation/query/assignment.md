---
title: ARQ - Assignment
---

ARQ includes support for a logical assignment of variables. If the variable is
already bound, it acts like a filter, otherwise the value is assignment.
This makes it position independent.

This involves is syntactic extension and is available is the query
is parsed with language `Syntax.syntaxARQ` (which is the default).

See also [SELECT expressions](select_expr.html) which is also a
form of assignment.

## Assignment

The general form is:

    LET ( variable := expression )

For example:

    LET ( ?x := 2 )

    { ?x :name ?name .
      LET ( ?age2 := ?age - 21 )

Note: Assignment is "**:=**"

## Assignment Rules

ARQ assignment is single assignment, that is, once a variable is
assigned a binding, then it can not be changed in the same query
solution.

Only one `LET` expression per variable is allowed in a single
scope.

The execution rules are:

-   If the expression does not evaluate (e.g. unbound variable in
    the expression), no assignment occurs and the query continues.
-   If the variable is unbound, and the expression evaluates, the
    variable is bound to the value.
-   If the variable is bound to the same value as the expression
    evaluates, nothing happens and the query continues.
-   If the variable is bound to a different value as the expression
    evaluates, an error occurs and the current solution will be
    excluded from the results.

Note that "same value" means the same as applies to graph pattern
matching, not to FILTER expressions. Some graph implementation only
provide same-term graph pattern matching. FILTERs always do
value-based comparisons for "=" for all graphs.

## Use with CONSTRUCT

One use is to perform some calculation prior to forming the result
graph in a CONSTRUCT query.

    CONSTRUCT { ?x :lengthInCM ?cm }
    WHERE
    {
       ?x :lengthInInches ?inch .
       LET ( ?cm := ?inches/2.54 )
    }

## Use with !BOUND

The OPTIONAL/!BOUND/FILTER idiom for performing limited negation of
a pattern in SPARQL can be inconvenient because it requires a
variable in the OPTIONAL to be assigned by pattern matching.  Using
a LET can make that easier; here, we assign to ?z (any value will
do) to mark when the matching pattern included the OPTIONAL
pattern.

Example: ?x with no ":p 1" triple:

    {
      ?x a :FOO .
      OPTIONAL { ?x :p 1 . LET (?z := true) }
      FILTER ( !BOUND(?z) )
    }

Note that [negation is supported properly](negation.html) through
the `NOT EXISTS` form.

[ARQ documentation index](index.html)
