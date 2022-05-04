---
title: Reading JSON-LD 1.1
---

<i>
JSON-LD 1.1 is the default version of JSON-LD supported by Apache Jena.  

This page is out of date and left temporary only for information about using
JSON-LD 1.1 in versions 4.2.x to 4.4.x.
</i>

----

This page details support for reading JSON-LD 1.1 using 
[Titanium JSON-LD](https://github.com/filip26/titanium-json-ld/).

While Titanium is licensed under the Apache License, it has a dependency on
the Eclipse Jakarta JSON Processing API, which is licensed under the Eclipse
Public License 2.0.

## Additional Dependencies

The Titanium engine (`com.apicatalog:titanium-json-ld`) uses the Eclipse Jakarta JSON Processing
licensed under the 
[Eclipse Public License 2.0](https://www.eclipse.org/legal/epl-2.0/) with dependencies:

* jakarta.json:jakarta.json-api
* org.glassfish:jakarta.json

Failure to add these dependencies will result in `UnsupportedOperationException`
```
Need both titanium-json-ld (1.1.0 or later) and org.glassfish:jakarta on the classpath
```

## Usage

Jena currently (from version 4.2.0) offers both JSON-LD 1.0 and also JSON-LD 1.1.

The file extension for JSONLD 1.1 is `.jsonld11`.

If not reading from a file with this file extension, the application needs to
force the language choice to be JSON-LD 1.1 with 
[`RDFParser`](https://jena.apache.org/documentation/javadoc/arq/org/apache/jena/riot/RDFParser.html)
using `forceLang(Lang.JSONLD11)`:

```
RDFParser.source(...)
    .forceLang(Lang.JSONLD11)
    ...
    .build()
```
or short-cut form:
```
RDFParser.source(URL or InputStream)
    .forceLang(Lang.JSONLD11)
    .parse(dataset);
```
