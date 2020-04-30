---
title: ARQ - Filter Forms
---

This page describes function-like operators that can be used in
expressions, such as FILTERs, assignments and SELECT expressions.

These are not strictly functions - the evaluation semantics of
custom functions is to evaluate each argument then call the
function with the results of the sub-expressions. Examples in
standard SPARQL include `bound`, which does not evaluate a variable
as an expression but just tests whether it is set or not, and
boolean operators `||` and `&&` which handle errors and do not just
evaluate each branch and combining the results.

These were previously ARQ extensions but are now legal SPARQL 1.1

## IF

The `IF` form evaluates its first argument to get a boolean
result, then evaluates and return the value of the second if the
boolean result is true, and the third argument if it is false.

Examples:

    IF ( ?x<0 , "negative" , "positive" )

    # A possible way to do default values.
    LET( ?z := IF(bound(?z) , ?z , "DftValue" ) )

## COALESCE

The `COALESCE`form returns the first argument of its argument list
that is bound.

    # Suppose ?y is bound to "y" and ?z to "z" but ?x is not.
    COALESCE(?x , ?y , ?z) # return "y"


[ARQ documentation index](index.html)
