---
title: Functions in ARQ
---

The regular expressions for fan:localname and afn:namespace were incorrect.
SPARQL allows custom functions in expressions so that
queries can be used on domain-specific data. SPARQL defines a
function by URI (or prefixed name) in FILTER expressions.  ARQ
provides a function library and supports application-provided
functions.  Functions and property functions can be
[registered or dynamically loaded](extension.html).

Applications can also
[provide their own functions](writing_functions.html).

ARQ also provides an implementation the 
[Leviathan Function Library](http://www.dotnetrdf.org/leviathan).

### XQuery/XPath Functions and Operators supported

ARQ supports the scalar functions and operators from 
"[XQuery 1.0 and XPath 2.0 Functions and Operators v3.1](https://www.w3.org/TR/xpath-functions-3/)". 

Functions in involving sequences are not supported.

See [XSD Support](xsd-support.html) for details of datatypes and functions
currently supported.  To check the exact current registrations, see
<tt>[function/StandardFunctions.java](https://github.com/apache/jena/blob/main/jena-arq/src/main/java/org/apache/jena/sparql/function/StandardFunctions.java)</tt>.

See also the [property functions](library-propfunc.html) library
page.

### Function Library

The prefix `afn` is `<http://jena.apache.org/ARQ/function#>`.
(The old prefix of `<http://jena.hpl.hp.com/ARQ/function#>` continues to
work. Applications are encouraged to switch.)

Direct loading using a URI prefix of
`<java:org.apache.jena.sparql.function.library.>` (note the final
dot) is deprecated.

The prefix `fn` is `<http://www.w3.org/2005/xpath-functions#>` (the
XPath and XQuery function namespace).

The prefix `math` is `<http://www.w3.org/2005/xpath-functions/math#>`.

### Custom Aggregates

The prefix `agg:` is `<http://jena.apache.org/ARQ/function/aggregate#>`.

The statistical aggregates are provided are:

`agg:stdev`, `agg:stdev_samp`, `agg:stdev_pop`,
`agg:variance`, `agg:var_samp`, `agg:var_pop`

These are modelled after SQL aggregate functions `STDEV`, `STDEV_SAMP`, `STDEV_POP`,
`VARIANCE`, `VAR_SAMP`, `VAR_POP`.

These, as keywords, are available in ARQ's extended SPARQL (parse using `Syntax.syntaxARQ`).

### Additional Functions Provided by ARQ

Most of these have equivalents, or near equivalents, in SPARQL or as an
XQuery function and are to be preferred. These ARQ-specific versions remain
for compatibility.

**RDF Graph Functions**

Function name | Description | Alternative
------------- | ----------- | -----------
`afn:bnode(?x)`  | Return the blank node label if ?x is a blank node. | `STR(?x)`
`afn:localname(?x)` | The local name of ?x | `REPLACE(STR(?x), "^(.*)(/|#)([^#/]*)$", "$3")`
`afn:namespace(?x)` | The namespace of ?x  | `REPLACE(STR(?x), "^(.*)(/|#)([^#/]*)$", "$1")`

The prefix and local name of a IRI is based on splitting the IRI, not on any prefixes in the query or dataset.

**String Functions**

Function name | Description | Alternative
------------- | ----------- | -----------
`afn:sprintf(format, v1, v2, ...)` | Make a string from the format string and the RDF terms.
`afn:substr(string, startIndex [,endIndex])` | Substring, Java style using *`startIndex`* and *`endIndex`*.
`afn:substring` | Synonym for afn:substr
`afn:strjoin(sep, string ...)` | Concatenate string together, with a separator.
`afn:sha1sum(resource)` | Calculate the SHA1 checksum of a literal or URI | `SHA1(STR(resource))`

Notes:

1.  Strings in
    "[XQuery 1.0 and XPath 2.0 Functions and Operators](http://www.w3.org/TR/xpath-functions-3/)"
    start from character position one, unlike Java and C\# where
    strings start from zero.
2.  The `fn:substring` operation takes an optional length, like C\#
    but different from Java, where it is the *endIndex* of the first
    character after the substring.
3.  `afn:substr` uses Java-style  *`startIndex`* and *`endIndex`*.

**Mathematical Functions**

Function name | Description | Alternative
------------- | ----------- | -----------
`afn:min(num1, num2)` | Return the minimum of two numbers | `fn:min`
`afn:max(num1, num2)` | Return the maximum of two numbers | `fn:max`
`afn:pi()` | The value of pi, as an XSD double | `math:pi()`
`afn:e()` | The value of e, as an XSD double | `math:exp(1)`
`afn:sqrt(num)` | The square root of num | `math:sqrt`

**Miscellaneous Functions**

Function name | Description | Alternative
------------- | ----------- | -----------
`afn:now()` | Current time. Actually, the time the query started. | `NOW()`
`afn:sha1sum(resource)` | Calculate the SHA1 checksum | `SHASUM`
