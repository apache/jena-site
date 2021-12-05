---
title: Reading RDF in Apache Jena
---

This page details the setup of RDF I/O technology (RIOT) for Apache Jena.

See [Writing RDF](rdf-output.html) for details of the RIOT Writer system.

* [API](#api)
  * [Determining the RDF syntax](#determining-the-rdf-syntax)
  * [Example 1 : Using the RDFDataMgr](#using-rdfdatamgr)
  * [Example 2 : Model usage](#model-usage)
  * [Example 3 : Using RDFParser](#using-rdfparser)
* [Logging](#logging)
* [The StreamManager and LocationMapper](#streammanager-and-locationmapper)
  * [Configuring a `StreamManager`](#configuring-a-streammanager)
  * [Configuring a `LocationMapper`](#configuring-a-locationmapper)
* [Advanced examples](#advanced-examples)
  * [Iterating over parser output](#iterating-over-parser-output)
  * [Filtering the output of parsing](#filter-the-output-of-parsing)
  * [Add a new language](#add-a-new-language)

Full details of operations are given in the javadoc.

## API

Much of the functionality is accessed via the Jena Model API; direct
calling of the RIOT subsystem isn't needed.  A resource name
with no URI scheme is assumed to be a local file name.

Applications typically use at most `RDFDataMgr` to read RDF datasets.

The major classes in the RIOT API are:

| Class | Comment |
|-------|---------|
| RDFDataMgr        | Main set of functions to read and load models and datasets |
| StreamRDF         | Interface for the output of all parsers |
| RDFParser         | Detailed setup of a parser |
| StreamManager     | Handles the opening of typed input streams |
| RDFLanguages      | Registered languages |
| RDFParserRegistry | Registered parser factories |

### Determining the RDF syntax

The syntax of the RDF file is determined by the content type (if an HTTP
request), then the file extension if there is no content type. Content type
`text/plain` is ignored; it is assumed to be type returned for an unconfigured
http server. The application can also pass in a declared language hint.

The string name traditionally used in `model.read` is mapped to RIOT `Lang`
as:

| Jena reader          | RIOT Lang        |
|----------------------|------------------|
| `"TURTLE"`           | `TURTLE`         |
| `"TTL"`              | `TURTLE`         |
| `"Turtle"`           | `TURTLE`         |
| `"N-TRIPLES"`        | `NTRIPLES`       |
| `"N-TRIPLE"`         | `NTRIPLES`       |
| `"NT"`               | `NTRIPLES`       |
| `"RDF/XML"`          | `RDFXML`         |
| `"N3"`               | `N3`             |
| `"JSON-LD"`          | `JSONLD`         |
| `"RDF/JSON"`         | `RDFJSON`        |
| `"RDF/JSON"`         | `RDFJSON`        |

The following is a suggested Apache httpd .htaccess file:

    AddType  text/turtle               .ttl
    AddType  application/rdf+xml       .rdf
    AddType  application/n-triples     .nt

    AddType  application/ld+json       .jsonld

    AddType  text/trig                 .trig
    AddType  application/n-quads       .nq

    AddType  application/trix+xml      .trix
    AddType  application/rdf+thrift    .rt
    AddType  application/rdf+protobuf  .rpb

### Example 1 : Using the RDFDataMgr {#using-rdfdatamgr}

`RDFDataMgr` provides operations to load, read and write models and datasets.

`RDFDataMgr` "load" operations create an
in-memory container (model, or dataset as appropriate); "read" operations
add data into an existing model or dataset.

    // Create a model and read into it from file 
    // "data.ttl" assumed to be Turtle.
    Model model = RDFDataMgr.loadModel("data.ttl") ;

    // Create a dataset and read into it from file 
    // "data.trig" assumed to be TriG.
    Dataset dataset = RDFDataMgr.loadDataset("data.trig") ;

    // Read into an existing Model
    RDFDataMgr.read(model, "data2.ttl") ;

### Example 2 : Common usage {#model-usage}

The original Jena Model API operation for `read` and `write` provide another way to the same machinery:

    Model model = ModelFactory.createDefaultModel() ;
    model.read("data.ttl") ;

If the syntax is not as the file extension, a language can be declared:

    model.read("data.foo", "TURTLE") ;

### Example 3 : Using RDFParser {#using-rdfparser}

Detailed control over the setup of the parsing process is provided by
`RDFParser` which provides a builder pattern.  It has many options - see
[the javadoc for all details](/documentation/javadoc/arq/org/apache/jena/riot/RDFParser.html).

For example, to read Trig data, and set the error handler specially,

        // The parsers will do the necessary character set conversion.  
        try (InputStream in = new FileInputStream("data.some.unusual.extension")) {
            RDFParser.create()
                .source(in)
                .lang(RDFLanguages.TRIG)
                .errorHandler(ErrorHandlerFactory.errorHandlerStrict)
                .base("http://example/base")
                .parse(noWhere);
        }

## Logging

The parsers log to a logger called `org.apache.jena.riot`.  To avoid `WARN`
messages, set this to `ERROR` in the logging system of the application.

## StreamManager and LocationMapper

Operations to read RDF data can be redirected to local copies and to other URLs.
This is useful to provide local copies of remote resources.

By default, the `RDFDataMgr` uses the global `StreamManager` to open typed
InputStreams.  The `StreamManager` can be set using the `RDFParser` builder:

        // Create a copy of the global default StreamManager.
        StreamManager sm = StreamManager.get().clone();
        // Add directory "/tmp" as a place to look for files
        sm.addLocator(new LocatorFile("/tmp"));

        RDFParser.create()
            .streamManager(sm)
            .source("data.ttl")
            .parse(...);

It can also be set in a `Context` object given the the RDFParser for the
operation, but normally this defaults to the global `Context` available via
`Context.get()`.  The constant `SysRIOT.sysStreamManager`, which is
`http://jena.apache.org/riot/streamManager`, is used.

Specialized StreamManagers can be configured with specific locators for
data:

* File locator (with own current directory)
* URL locator
* Class loader locator
* Zip file locator

### Configuring a `StreamManager`

The `StreamManager` can be reconfigured with different places to look for
files.  The default configuration used for the global `StreamManager` is
a file access class, where the current directory is that of the java
process, a URL accessor for reading from the web, and a
class loader-based accessor.  Different setups can be built and used
either as the global set up, or on a per request basis.

There is also a `LocationMapper` for rewriting file names and URLs before
use to allow placing known names in different places (e.g. having local
copies of import http resources).

### Configuring a `LocationMapper`

Location mapping files are RDF, usually written in Turtle although
an RDF syntax can be used.

    @prefix lm: <http://jena.hpl.hp.com/2004/08/location-mapping#>

    [] lm:mapping
       [ lm:name "file:foo.ttl" ;      lm:altName "file:etc/foo.ttl" ] ,
       [ lm:prefix "file:etc/" ;       lm:altPrefix "file:ETC/" ] ,
       [ lm:name "file:etc/foo.ttl" ;  lm:altName "file:DIR/foo.ttl" ]
       .

There are two types of location mapping: exact match renaming and
prefix renaming. When trying to find an alternative location, a
`LocationMapper` first tries for an exact match; if none is found,
the LocationMapper will search for the longest matching prefix. If
two are the same length, there is no guarantee on order tried;
there is no implied order in a location mapper configuration file
(it sets up two hash tables).

In the example above, `file:etc/foo.ttl` becomes `file:DIR/foo.ttl`
because that is an exact match. The prefix match of file:/etc/ is
ignored.

All string tests are done case sensitively because the primary use
is for URLs.

Notes:

* Property values are not URIs, but strings. This is a system
  feature, not an RDF feature. Prefix mapping is name rewriting;
  alternate names are not treated as equivalent resources in the rest
  of Jena. While application writers are encouraged to use URIs to
  identify files, this is not always possible.
* There is no check to see if the alternative system resource is
  equivalent to the original.

A LocationMapper finds its configuration file by looking for the
following files, in order:

* `file:location-mapping.rdf`
* `file:location-mapping.ttl`
* `file:etc/location-mapping.rdf`
* `file:etc/location-mapping.ttl`

This is a specified as a path - note the path separator is always
the character ';' regardless of operating system because URLs
contain ':'.

Applications can also set mappings programmatically. No
configuration file is necessary.

The base URI for reading models will be the original URI, not the alternative location.

## Advanced examples

Example code may be found in [jena-examples:arq/examples](https://github.com/apache/jena/tree/main/jena-examples/src/main/java/arq/examples/arq/examples/riot/).

### Iterating over parser output

One of the capabilities of the RIOT API is the ability to treat parser output as an iterator,
this is useful when you don't want to go to the trouble of writing a full sink implementation and can easily express your
logic in normal iterator style.

To do this you use `AsyncParser.asyncParseTriples` which parses the input on
another thread:

        Iterator<Triple> iter = AsyncParser.asyncParseTriples(filename);
        iter.forEachRemaining(triple->{
            // Do something with triple
        });

For N-Triples and N-Quads, you can use
`RiotParsers.createIteratorNTriples(input)` which parses the input on the
calling thread.

[RIOT example 9](https://github.com/apache/jena/blob/main/jena-examples/src/main/java/arq/examples/riot/ExRIOT9_AsyncParser.java).

### Filter the output of parsing

When working with very large files, it can be useful to 
process the stream of triples or quads produced
by the parser so as to work in a streaming fashion.

See [RIOT example 4](https://github.com/apache/jena/blob/main/jena-examples/src/main/java/arq/examples/arq/examples/riot/ExRIOT4_StreamRDF_Filter.java)

### Add a new language

The set of languages is not fixed. A new language, 
together with a parser, can be added to RIOT as shown in
[RIOT example 5](https://github.com/apache/jena/tree/main/jena-examples/src/main/java/arq/examples/arq/examples/riot/ExRIOT5_StreamRDFCollect.java)
