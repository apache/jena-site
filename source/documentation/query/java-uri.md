---
title: ARQ - The `java:` URI scheme
---

ARQ uses URIs of the form `<java:<i>package.class</i>>` to provide
dynamic loading of code for
[value functions](extension.html#valueFunctions) and
[property functions](extension.html#propertyFunctions). ARQ loads
the class when needed. For functions and property functions, it
also wraps it in the necessary factory code. A new instance of the
function or property function is created for each mention of the
name in each query.

## Dynamic Code Loading

Any classes loaded by ARQ must already be on the java classpath.
ARQ does not create any new class loaders, nor modify the Java
class path in any way. The class path must be set up to include any
class files or jar files for dynamically loaded code.

Classes can be mor conveniently named in queries using SPARQL
`PREFIX`es but because dots can't appear in the local part of a
prefixed name, all the package name and the final dot must be in
the `PREFIX` declaration.

    PREFIX fn: <java:org.example.functions.>    # Including the final dot
    ...
      FILTER fn:alter(?x)
    ...

## Remapping

All code loading is performed via the `MappedLoader` class. Before
actually loading the code, the mapped loader applies any
transformation of URIs. For example, the ARQ function library has a
namespace of `<http://jena.apache.org/ARQ/function#>` and resides
in the Java package org.apache.jena.sparql.function.library. The
mapped loader includes a partial rewrite rule turning http URLs
starting with that namespace into java: URIs using the package
name.
