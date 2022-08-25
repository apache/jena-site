---
title: Service Enhancer
---

The service enhancer (SE) plugin extends the functionality of the SERVICE clause with:

- Bulk requests
- Correlated joins also known as lateral joins
- A streaming cache for `SERVICE` requests results which can also cope with bulk requests and correlated joins. Furthermore, queries that only differ in limit and offset will result
in cache hits for overlapping ranges. At present, the plugin only ships with an in-memory caching provider.

As a fundamental principle, a request making use of `cache` and `bulk` should return the exact same result as if
those settings were omitted. As a consequence runtime result set size recognition (RRR) is employed to reveal hidden
result set limits and ensure that always only the appropriate amount of data is returned from the caches.

A correlated join using this plugin is syntactically expressed with `SERVICE <loop:> {}`.
It is a binary operation on two graph patterns:
The operation "loops" over every binding obtained from evaluation of the left-hand-side (lhs) and uses it as an input to substitute the variables of the right-hand-side (rhs).
Afterwards, the substituted rhs is evaluated to sequence of bindings. Each rhs binding is subsequently merged with lhs' input binding to produce a solution binding of the join.

## Example
The following query demonstrates the features of the service enhancer.
It executes as a single remote request to Wikidata:

```sparql
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX wd: <http://www.wikidata.org/entity/>
SELECT ?s ?l {
  # The ids below correspond in order to: Apache Jena, Semantic Web, RDF, SPARQL, Andy Seaborne
  VALUES ?s { wd:Q1686799 wd:Q54837 wd:Q54872 wd:Q54871 wd:Q108379795 }
 
  SERVICE <cache:loop:bulk+5:https://query.wikidata.org/sparql> {
    SELECT ?l {
      ?s rdfs:label ?l
      FILTER(langMatches(lang(?l), 'en'))
    } ORDER BY ?l LIMIT 1
  }
}
```

<details>
  <summary markdown="span">Click here to view the rewritten Query</summary>

```sparql
SELECT  *
WHERE
  {   {   { { SELECT  *
              WHERE
                { { SELECT  ?l
                    WHERE
                      { <http://www.wikidata.org/entity/Q1686799>
                                  <http://www.w3.org/2000/01/rdf-schema#label>  ?l
                        FILTER langMatches(lang(?l), "en")
                      }
                  }
                  BIND(0 AS ?__idx__)
                }
              LIMIT   1
            }
          }
        UNION
          {   { { SELECT  *
                  WHERE
                    { { SELECT  ?l
                        WHERE
                          { <http://www.wikidata.org/entity/Q54837>
                                      <http://www.w3.org/2000/01/rdf-schema#label>  ?l
                            FILTER langMatches(lang(?l), "en")
                          }
                      }
                      BIND(1 AS ?__idx__)
                    }
                  LIMIT   1
                }
              }
            UNION
              {   { { SELECT  *
                      WHERE
                        { { SELECT  ?l
                            WHERE
                              { <http://www.wikidata.org/entity/Q54872>
                                          <http://www.w3.org/2000/01/rdf-schema#label>  ?l
                                FILTER langMatches(lang(?l), "en")
                              }
                          }
                          BIND(2 AS ?__idx__)
                        }
                      LIMIT   1
                    }
                  }
                UNION
                  {   { { SELECT  *
                          WHERE
                            { { SELECT  ?l
                                WHERE
                                  { <http://www.wikidata.org/entity/Q54871>
                                              <http://www.w3.org/2000/01/rdf-schema#label>  ?l
                                    FILTER langMatches(lang(?l), "en")
                                  }
                              }
                              BIND(3 AS ?__idx__)
                            }
                          LIMIT   1
                        }
                      }
                    UNION
                      { { SELECT  *
                          WHERE
                            { { SELECT  ?l
                                WHERE
                                  { <http://www.wikidata.org/entity/Q108379795>
                                              <http://www.w3.org/2000/01/rdf-schema#label>  ?l
                                    FILTER langMatches(lang(?l), "en")
                                  }
                              }
                              BIND(4 AS ?__idx__)
                            }
                          LIMIT   1
                        }
                      }
                  }
              }
          }
      }
    UNION
      # This union member adds an end marker
      # Its absence in responses is
      # used to detect result set size limits
      { BIND(1000000000 AS ?__idx__) }
  }
ORDER BY ASC(?__idx__) ?l
```

Note that in the query above `?s` has been substituted based on the respective input bindings (in this case the Wikidata IRIs).
For every bulk query execution, the SE plugin assigns an increasing ID to every input binding (starting from 0). This ID is included in the service request via the
`?__idx__` variable. (If the variable is already used then an unused name is allocated by appending a number such as `?__idx__1`).
Every obtained binding's `?__idx__`  value determines the input binding that has to be merged with in order to produce the final binding.
A special value for `?__idx__` is the  end marker. It is a number higher than any input binding ID and it is used to detect result set size limits: It's absence in a result set
means that it was cut off. This information is used to ensure that a request using a certain service IRI does not yield more results than limit.

</details>


Note that a repeated execution of a query (possibly with different limits/offsets) will serve the data from cache rather than making another remote request.
The cache operates on a per-input-binding basis: For instance, in the example above it means that when removing bindings from the `VALUES` block data will
still be served from the cache. Conversely, adding additional bindings to the `VALUES` block will only send a (bulk) remote request for those
that lack cache entries.

## Namespace
The plugin introduces the namespace `http://jena.apache.org/service-enhancer#` which is used for both ARQ context symbols as well as assembler configuration.

## Maven Dependency

```xml
<dependency>
    <groupId>org.apache.jena</groupId>
    <artifactId>jena-serviceenhancer</artifactId>
    <version><!-- Check the link below for available versions --></version>
</dependency>
```
[Available Versions](https://mvnrepository.com/artifact/org.apache.jena/jena-serviceenhancer).

Adding this dependency will automatically initialize the plugin via service-loading of `org.apache.jena.sparql.service.enhancer.init.ServiceEnhancerInit`
using Jena's plugin system.

## Programmatic Setup
Loading the `jena-serviceenhancer` jar file automatically enables bulk requests and caching.
Correlated joins however require explicit activation because they require specific algebra transformations to run as part of the query optimization process.
For more details about the transformation see [Programmatic Algebra Transformation](#programmatic-algebra-transformation).

The following snippet globally enables correlated joins by overriding the context's optimizer:
```java
import org.apache.jena.sparql.service.enhancer.init.ServiceEnhancerInit;

ServiceEnhancerInit.wrapOptimizer(ARQ.getContext());
```

As usual, in order to avoid a global setup, the the context of a dataset or statement execution (i.e. query / update) can be used instead:
```java
DatasetFactory dataset = DatasetFactory.create();
ServiceEnhancerInit.wrapOptimizer(dataset.getContext());
```

The lookup proceduce for which optimizer to wrap first consults the given context and then the global one.
If neither has an optimizer configured then Jena's default one will be used.

Service requests that do not make use of this plugin's options will not be affected even if the plugin is loaded.
The plugin registration makes use of the [custom service executor extension system](/documentation/query/custom_service_executors.html).

## Assembler
The `se:DatasetServiceEnhancer` assembler can be used to enable the SE plugin on a dataset.
This procedure also automatically enables correlated joins using the dataset's context as described in [Programmatic Setup](#programmatic-setup).
By default, the SE assembler alters the base dataset's context and returns the base dataset again.
There is one important exception: If `se:enableMgmt` is true then the assembler's final step it to create a wrapped dataset with a copy of the original dataset's context where `enableMgmt` is true.
This way, management functions are not available in the base dataset.

```ttl
# assembler.ttl
PREFIX ja: <http://jena.hpl.hp.com/2005/11/Assembler#>
PREFIX se: <http://jena.apache.org/service-enhancer#>
<urn:example:root>
  a se:DatasetServiceEnhancer ;
  ja:baseDataset <urn:example:base> ;
  se:datasetId <https://my.dataset.id/> ; # Defaults to the value of ja:baseDataset
  se:cacheMaxEntryCount 300 ;             # Maximum number of cache entries ;
                                          # identified by the tuple (service IRI, query, input binding)
  se:cacheMaxPageCount 15 ;               # Maximum number of pages per cache entry
  se:cachePageSize 10000 ;                # Number of bindings per page
  se:enableMgmt false                     # Enables management functions;
                                          # wraps the base dataset with an independent context
  .

<urn:example:base> a ja:MemoryDataset .
```

In the example above, the shown values for `se:cacheMaxEntryCount`, `se:cacheMaxPageCount` and `se:cachePageSize` are the defaults which are used if those options are left unspecified.
They allow for caching up to 45mio bindings (300 x 15 x 10000).
There is one caveat though: Specifying the cache options puts a new a cache instance in the dataset's context. Without these options the global cache instance that is registered in the ARQ context by the SE plugin during service loading is used.
Presently, the global instance cannot be configured via the assembler.


Creating a dataset from the specification above is programmatically accomplished as follows:
```java
Model spec = RDFDataMgr.load("assembler.ttl");
Dataset dataset = DatasetFactory.assemble(spec.getResource("urn:example:root"));
```

The value of `se:datasetId` is used to look up caches when referring to the active dataset using `SERVICE <urn:x-arq:self> {}`.

### Configuration with Fuseki

#### Adding the Service Enhancer JAR
This section assumes that one of the distributions of `apache-jena-fuseki` has been downloaded from [https://jena.apache.org/download/].
The extracted folder should contain the `./fuseki-server` executable start script which automatically loads all jars (relative to `$PWD`) under `run/extra`.
These folders need to be created e.g. using `mkdir -p run/extra`. The SE plugin can be manually built or downloaded from maven central (it is self-contained without transitive dependencies).
Placing it into the `run/extra` folder makes it available for use with Fuseki. The plugin and Fuseki version should match.

#### Fuseki Assembler Configuration
The snippet below shows a simple setup of enabling the SE plugin for a given base dataset.
Cache management can be performed via SPARQL extension functions. However, usually not every user should be allowed to invalidate caches as this
could be exploited for service disruptions. Jena does not directly provide a security model for access privileges on functions such as
known from SQL DBMSs. However, with Fuseki it is possible to create both a public and an admin endpoint over the same base dataset:

```ttl
<#myServicePublic> a fuseki:Service; fuseki:name "test"; fuseki:dataset <#myDsPublic> .
<#myServiceAdmin>  a fuseki:Service; fuseki:name "testAdmin"; fuseki:dataset <#myDsAdmin> .

<#myDsPublic>      a se:DatasetServiceEnhancer ; ja:baseDataset <#myDsBase> .
<#myDsAdmin>       a se:DatasetServiceEnhancer ; ja:baseDataset <#myDsBase> ; se:enableMgmt true .

<#myDsBase>        a ja:MemoryDataset .
```

For configuring access control with Fuseki please refer to [Data Access Control for Fuseki](/documentation/fuseki2/fuseki-data-access-control.html).

## Context Symbols
The service enhancer plugin defines several symbols for configuration via context.
The context symbols are in the namespace `http://jena.apache.org/service-enhancer#`.

| Symbol                       | Value type             | Default\* | Description |
|------------------------------|------------------------|-----------|-------------|
| `enableMgmt`                 | boolean                | false     | This symbol must be set to true in the context in order to allow calling certain "privileged" SPARQL functions. |
| `serviceBulkBindingCount`    | int                    | 10        | Number of bindings to group into a single bulk request |
| `serviceBulkMaxBindingCount` | int                    | 100       | Maximum number of input bindings to group into a single bulk request; restricts `serviceBulkRequestItemCount`. When using `bulk+n` then `n` will be capped to the configured value. |
| `datasetId`                  | String                 | null      | An IRI to resolve `urn:x-arq:self` to. Used to discriminate cache entries for self-referenced datasets. |
| `serviceCache`               | ServiceResponseCache   | null      | Symbol for the cache of services' result sets |
| `serviceResultSizeCache`     | ServiceResultSizeCache | null      | Symbol for the cache of services' result set sizes |


\* The value that is assumed if the symbol is absent.


The class `org.apache.jena.sparql.service.enhancer.init.ServiceEnhancerConstants` defines the constants for programmatic usage.
As usual, context attributes can be set on global, dataset and query execution level:
```java
// Global level
ARQ.getContext().set(ServiceEnhancerConstants.serviceBulkBindingCount, 5);

// Dataset level
Dataset dataset = DatasetFactory.create();
dataset.getContext().set(ServiceEnhancerConstants.datasetId, "http://example.org/myDatasetId");

// Query Execution level
try (QueryExecution qe = QueryExecutionFactory.create(dataset, "SELECT * { ?s ?p ?o }")) {
  qe.getContext().set(ServiceEnhancerConstants.enableMgmt, true);
  // ...
}
```

## Service Options
The service option syntax is used to express a list of key-value pairs followed by an optional IRI.
The first pair must always be terminated by a `:` in order to avoid misinterpreting it as a relative IRI which would be resolved against the configured base IRI.
Multiple pairs are separated using `:`. Pairs may be followed by an IRI for the service. If it is absent, then the IRI `urn:x-arq:self` is implicitly assumed.

```
(key[+value]:)* (key[+value][:] | IRI)
```

The special IRI `urn:x-arq:self` is used to refer to the active dataset. This is the dataset the query is executed against. If service options are present that are not followed by an IRI then this IRI is assumed.
Consequently, Both e.g. `SERVICE <cache:>` or `SERVICE <bulk:loop>` refer the active dataset.

### Bulk Requests
The `bulk` key enables bulk requests. The default bulk size is based on `serviceBulkBindingCount`. It can be overridden using e.g. `SERVICE <bulk+20:> {...}`. The specified number is silently capped by `serviceBulkMaxBindingCount`.

Execution of a bulk request proceeds by first taking `n` items from the lhs to form a batch.
Then the bulk query is generated by forming a union where the service's graph pattern is substituted with every input binding in the batch as shown in the [example](#example).

### Correlated Joins
Informally, conventional joins in SPARQL are bottom-up such that the result of a join is obtained from evaluating the lhs and rhs of a join independently and merging all compatible bindings (and discarding the incompatible ones).
Correlated joins are left-to-right such that each binding obtained from lhs's evaluation is used to substitute the rhs prior to its evaluation.
Correlated joins alter the scoping rules of variables as demonstrated by the subsequent two examples.

The following concepts are relevant to understand the how correlated joins are dealt with:
* **Scope rename** SPARQL evaluation has a notion of scoping which determines whether a variable will be part of the solution bindings created from a graph pattern [as defined here](https://www.w3.org/TR/sparql11-query/#variableScope). Jena provides `TransformScopeRename` which renames variables such as their names are globally. Jena's scope renaming prepends `/` characters before the original variable name so `?x` may become `?/x` or `?//x`. `TransformScopeRename` is applied by the default optimizer.
* **Substitution** When evaluating the lhs of a join then the scope renaming enables that for each obtained binding all variables on the rhs can be substituted with the corresponding values of that binding.
* **Base name** The base name of a variable is it's name without scoping. For example the variables `?x`, `?/x` and `?//x` all have the base name `x`.
* **Join key** A join key of a join operation is the set of variables that is the intersection of lhs' **visible** variables with rhs' **mentioned** ones.
* **Join binding** A join binding is obtained by projecting an lhs' input binding with a join key. It is used to substitute variables on the rhs and is part of the key object used in caching.

#### Example of Scoping in a Conventional join
Consider the following example.
```sparql
SELECT ?p ?c {
  BIND(<http://www.w3.org/1999/02/22-rdf-syntax-ns#type> AS ?p)
  { SELECT (COUNT(*) AS ?c) { ?s ?p ?o } }
}
```

Note that the `?p` on the right hand side becomes scoped as `?/p`. Consequently, lhs' `?p`  and rhs' `?/p` are considered different variables.
```
(project (?p ?c)
  (join
    (extend ((?p <http://www.w3.org/1999/02/22-rdf-syntax-ns#type>))
      (table unit))
    (project (?c)
      (extend ((?c ?/.0))
        (group () ((?/.0 (count)))
          (bgp (triple ?/s ?/p ?/o))))))) # ?/p is different from the ?p on the lhs
```
Because there is no overlap in the variables on either side of the join the join key is the empty set of variables.

#### Example of Scoping in a Correlated Join

The two effects of the `loop:` transform are shown below. First, a `sequence` is enforced. And second, the scope of `?p` is now the same on the lhs and rhs.
```sparql
SELECT ?p ?c {
  BIND(<http://www.w3.org/1999/02/22-rdf-syntax-ns#type> AS ?p)
  SERVICE <loop:> { SELECT (COUNT(*) AS ?c) { ?s ?p ?o } }
}
```

The obtained algebra now includes `sequence` instead of `join` and the variable `?p` appears on both sides of it:
```
(project (?p ?c)
  (sequence
    (extend ((?p <http://www.w3.org/1999/02/22-rdf-syntax-ns#type>))
      (table unit))
    (service <loop:>
      (project (?c)
        (extend ((?c ?/.0))
          (group () ((?/.0 (count)))
            (bgp (triple ?/s ?p ?/o)))))))) # ?p is now the same here and on the lhs
```
The join key is set containing `?p` because this variable appears on either side of the join.
The lhs will produce a single join binding where `?p` is assigned to `rdf:type`.

Upon evaluation, for each input binding of the lhs the `?p` on the rhs is now substituted thus giving the count for the specific property.
Note, that the cache system of this plugin caches per join binding even for bulk requests. Hence, use of `SERVICE <loop:cache> {...}` will produce cache hits
for repeated join bindings regardless of the pattern on the lhs.


#### Programmatic Algebra Transformation
In order to make `loop:` work the following machinery is in place:

The algebra transformation implemented by `TransformSE_JoinStrategy` needs to run bothe **before** and **after** the **default** algebra optimization.
The reason is that is does two things:
* It converts every OpJoin instance with a `loop:` on the right hand side into a `OpSequence`.
* Any **mentioned** variable on the rhs whose base name matches the base name of a **visible** variable on the lhs gets substituted by the lhs variable.

```java
String queryStr = "SELECT ..."; // Put any example query string here
Transform loopTransform = new TransformSE_JoinStrategy();
Op op0 = Algebra.compile(QueryFactory.create(queryStr));
Op op1 = Transformer.transform(loopTransform, op0);
Op op2 = Optimize.stdOptimizationFactory.create(ARQ.getContext()).rewrite(op1);
Op op3 = Transformer.transform(loopTransform, op2);
System.out.println(op3);
```

### Caching
Any graph pattern contained in a `SERVICE <cache:> { }` block is subject to caching.
The key of a cache entry is composed of three components:

* The concrete service IRI
* The input binding that originates from the lhs
* The (algebra of) the SERVICE clause's graph pattern (the rhs)

The cache is slice-aware: If the rhs corresponds to a SPARQL query making use of LIMIT and/or OFFSET then the cache lookup will find any priorly fetched overlapping ranges
and derive a backend request that only fetches the needed parts.

The `cache` service option can be used with the following values:
* `cache`: Read from cache when possible and write retrieved data to cache
* `cache+default`: Same as `cache`.
* `cache+clear`: Clears all cache entries for the current batch of input bindings.
* `cache+off`: Disables use the cache in the query execution

```sparql
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
SELECT * {
  BIND(rdf:type AS ?p)
  SERVICE <loop:cache:> {
    SELECT * {
      ?s ?p ?o
    } OFSET 10 LIMIT 10
    # ^ Altering limit/offset will match overlapping ranges of data in the cache
  }
}
```

Note, that in pathological cases this can require a bulk request to be repeatedly re-executed with disabled caches for each input binding.
For example, assume that the largest result yet set seen for a service is 1000 and the system is about to serve the 1001st binding from cache for a specific input binding.
The question is whether this would exceed the service's so far unknown result set size limit. Therefore, in order to answer that question a remote request that bypasses the cache is performed.
Furthermore, let's assume that request produces 2000 results. Then for the problem repeats once another input binding's 2001st result was about to be served.

### SPARQL Functions
The service enhancer plugin introduces functions and property functions for listing cache content and removing cache entries.
The namespace is

```
PREFIX se: <http://jena.apache.org/service-enhancer#>
```

| Signature                | Description |
|--------------------------|-------------|
| `long se:cacheRm()`      | Invalidates all entries from the cache that are not currently in use. Returns the number of invalidated entries. |
| `long se:cacheRm(long)`  | Attempts to remove the given entry. Returns 1 on success or 0 otherwise (e.g. entry did not exist or was still in use). |
| `?id se:cacheLs ([?serviceIri [?queryStr [?inputBindingStr]]])` | Property function to list cache content. |

```sparql
PREFIX sepf: <java:org.apache.jena.sparql.service.enhancer.pfunction.>
SELECT * WHERE {
  ?id sepf:cacheLs (?service ?query ?binding)
}
```

If e.g. data was cached using the following query, then `se:cacheLs` will yield the result set below.
```sparql
SELECT * {
  SERVICE <loop:> {
    { SERVICE <cache:> {
      SELECT (<urn:x-arq:DefaultGraph> AS ?g) ?p (COUNT(*) AS ?c) {
        ?s ?p ?o
      } GROUP BY ?p
    } }
  UNION
    { SERVICE <cache:> {
      SELECT ?g ?p (COUNT(*) AS ?c) {
        GRAPH ?g { ?s ?p ?o }
      } GROUP BY ?g ?p
    } }
  }

  # FILTER(CONTAINS(STR(?g), 'filter over ?g'))
  # FILTER(CONTAINS(STR(?p), 'filter over ?p'))
} order by DESC(?c) ?g ?p
```

```
------------------------------------------------------------------------------------------------------------------------------------------------------------------------
| id | service                           | query                                                                                                 | binding             |
========================================================================================================================================================================
| 2  | "urn:x-arq:self@dataset813601419" | "SELECT  (<urn:x-arq:DefaultGraph> AS ?g) ?p (count(*) AS ?c)\nWHERE\n  { ?s  a  ?o }\nGROUP BY ?p\n" | "( ?p = rdf:type )" |
| 3  | "urn:x-arq:self@dataset813601419" | "SELECT  ?g ?p (count(*) AS ?c)\nWHERE\n  { GRAPH ?g\n      { ?s  a  ?o }\n  }\nGROUP BY ?g ?p\n"     | "( ?p = rdf:type )" |
------------------------------------------------------------------------------------------------------------------------------------------------------------------------
```

#### Example: Invaliding all cache entries
```sparql
PREFIX se: <http://jena.apache.org/service-enhancer#>
SELECT (se:cacheRm() AS ?count) { }
```

#### Example: Invalidating specific cache entries
```sparql
PREFIX se: <http://jena.apache.org/service-enhancer#>

SELECT SUM(se:cacheRm(?id) AS ?count) {
  ?id se:cacheList (<http://dbpedia.org/sparql>)
}
```

For completeness, the functions can be addressed via their fully qualified Java class names:
```
<java:org.apache.jena.sparql.service.enhancer.pfunction.cacheLs>
<java:org.apache.jena.sparql.service.enhancer.function.cacheRm>
```

## Limitations, Troubleshooting and Pitfalls 

### Storing Caches to Disk
At present the plugin only ships with an in-memory implementation of the cache. Custom storage strategies can be implemented based one the interface `Slice`.
A file-based storage system is expected to be shipped with a later version of the SE plugin.

### Caching with Virtuoso
There is a bug in Virtuoso that causes queries making use of DISTINCT a with non-zero OFFSET without LIMIT to fail.
The remainder shows how the SE plugin may unexpectedly fail due to it and shows a workaround.

The following query will cause caching of the first 10 results:
```sparql
SELECT <cache:http://dbpedia.org/sparql> { SELECT DISTINCT ?s { ?s a ?o } ORDER BY ?s LIMIT 10 }
```

Executing the the following query afterwards will fail:
```sparql
SELECT <cache:http://dbpedia.org/sparql> { SELECT DISTINCT ?s { ?s a ?o } ORDER BY ?s }
```

The reason is that the first 10 results will be read from cache and the actual query sent as a remote request is:
```sparql
SELECT <cache:http://dbpedia.org/sparql> { SELECT DISTINCT ?s { ?s a ?o } ORDER BY ?s OFFSET 10 }
```
Thus we end up with a query using DISTINCT with a non-zero offset and without LIMIT.


As a workaround, note that if the service enhancer plugin detects a result set size limit then it will inject it in remote requests.
In such cases, executing the query `SELECT * { SERVICE <http://dbpedia.org/sparql> { ?s ?p ?o } }` once will make the result set size limit known
(at the time of writing DBpedia was configured with a limit of 10000), and therefore the modified request becomes

```sparql
SELECT <cache:http://dbpedia.org/sparql> { SELECT DISTINCT ?s { ?s a ?o } ORDER BY ?s OFFSET 10 LIMIT 10000 }
```

### Order of Bindings differ between Cache and Remote Reads
In practice, many triple store engines return the same response for the same graph pattern / query over the same physical database even if ordering is absent.
As can be seen from [example](#example), bulk requests result in a union which are sorted by the serial numbers assigned to the input bindings.
However, SPARQL does not mandate stable sorting, therefore this approach may cause bindings with the same serial number to become 'shuffled'.
The solution is to is to include sort sufficient conditions in the `SERVICE`'s graph pattern. The bulk query will include those sort conditions after the serial number sort condition.


