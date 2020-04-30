---
title: SDB Query performance
---

This page compares the effect of SDB with RDB, Jena's usual
database layout. RDB was designed for supporting the fine-grained
API calls as well as having some support for basic graph patterns.
Therefore, the RDB design goals were not those of SDB.

RDB uses a denormalised database layout in order that all
statement-level operations do not require additional joins. The
[SDB layout](database_layouts.html "SDB/Database Layouts") is
normalised so that the triple table is narrower and uses integers
for RDF nodes, then does do joins to get the node representation.
These optimizers for longer patterns, not API operations.

These figures were taken July 2007.

As with any performance figures, these should be taken merely as a
guide. The shape of the data, the hardware details, choice of
database, and its configuration (particularly amount of memory
used), as well as the queries themselves all greatly contribute to
the execution costs.

## Contents

-   [Setup](#setup)
-   [LUBM Query 1](#lubm-query-1)
-   [LUBM Query 2](#lubm-query-2)
-   [Summary](#summary)

## Setup

[Database and hardware setup](loading_performance.html#the-databases-and-hardware "SDB/Loading performance")
was the same as for the
[load performance](loading_performance.html "SDB/Loading performance")
tests.

Data was taken generated with the LUBM test generator (with N =
15), then the inference expanded on loading to give about 19.5
million triples. This data is larger than the database could
completely cache.

The queries are taken the LUBM suite and rewritten in SPARQL.

## LUBM Query 1

     PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
     PREFIX ub: <http://www.lehigh.edu/~zhp2/2004/0401/univ-bench.owl#>
     SELECT * WHERE
     {
         ?x rdf:type ub:GraduateStudent .
         ?x ub:takesCourse <http://www.Department0.University0.edu/GraduateCourse0> .
     }

Jena: 24.16s <br />
SDB/index: 0.014s<br />
SDB/hash: 0.04s

## LUBM Query 2

     PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
     PREFIX ub: <http://www.lehigh.edu/~zhp2/2004/0401/univ-bench.owl#>
     SELECT * WHERE
     {
          ?x rdf:type ub:GraduateStudent .
          ?y rdf:type ub:University .
          ?z rdf:type ub:Department .
          ?x ub:memberOf ?z .
          ?z ub:subOrganizationOf ?y .
          ?x ub:undergraduateDegreeFrom ?y .
     }

This query searches for a particular pattern in the data without
specific starting point.

Jena: 232.1s (153s with an addition index on OP) <br />
SDB/index: 12.7s <br />
SDB/hash: 3.7s

**Notes:** Removing the `rdf:type` statements actually slows the query down.

## Summary

In SPARQL queries, there is often a sufficiently complex graph
pattern that the SDb design tradeoff provides significant
advantages in query performance.



