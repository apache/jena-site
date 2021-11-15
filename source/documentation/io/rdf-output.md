---
title: Writing RDF in Apache Jena
---

This page describes the RIOT (RDF I/O technology) output capabilities.

See [Reading RDF](rdf-input.html) for details of the RIOT Reader system.

- [API](#api)
- [`RDFFormat`](#rdfformat)
- [`RDFFormat`s and Jena syntax names](#jena_model_write_formats)
- [Formats](#formats)
  - [Normal Printing](#normal-printing)
  - [Pretty Printed Languages](#pretty-printed-languages)
  - [Streamed Block Formats](#streamed-block-formats)
  - [Line printed formats](#line-printed-formats)
  - [Turtle and Trig format options](#opt-turtle-trig)
  - [N-Triples and N-Quads](#n-triples-and-n-quads)
  - [JSON-LD](#json-ld)
  - [RDF Binary](#rdf-binary)
  - [RDF/XML](#rdfxml)
- [Examples](#examples)
- [Notes](#notes)

See [Advanced RDF/XML Output](rdfxml_howto.html#advanced-rdfxml-output) 
for details of the Jena RDF/XML writer.

## API {#api}

There are two ways to write RDF data using Apache Jena RIOT, 
either via the `RDFDataMgr` 

    RDFDataMgr.write(OutputStream, Model, Lang) ;
    RDFDataMgr.write(OutputStream, Dataset, Lang) ;
    RDFDataMgr.write(OutputStream, Model, RDFFormat) ;
    RDFDataMgr.write(OutputStream, Dataset, RDFFormat) ;

or the legacy way using the `model` API, where there is a limited set of `"format"` names

    model.write(output, "format") ;

The *`format`* names are [described below](#jena_model_write_formats); they include the
names Jena has supported before RIOT.

Many variations of these methods exist.  See the full javadoc for details.

## `RDFFormat` {#rdfformat}

Output using RIOT depends on the format, which involves both the language (syntax)
being written and the variant of that syntax. 

The RIOT writer architecture is extensible.  The following languages
are available as part of the standard setup.

- Turtle
- N-Triples
- NQuads
- TriG
- JSON-LD
- RDF/XML
- RDF/JSON
- TriX
- RDF Binary

In addition, there are variants of Turtle, TriG for pretty printing, 
streamed output and flat output.  RDF/XML has variants for pretty printing 
and plain output.  Jena RIOT uses `org.apache.jena.riot.RDFFormat` as a way
to identify the language and variant to be written.  The class contains constants
for the standard supported formats.

Note:

- RDF/JSON is not JSON-LD. See the [description of RDF/JSON](rdf-json.html).
- N3 is treated as Turtle for output.

## `RDFFormat`s and Jena syntax names {#jena_model_write_formats}

The string name traditionally used in `model.write` is mapped to RIOT `RDFFormat`
as follows:

| Jena writer name     | RIOT RDFFormat   |
|----------------------|------------------|
| `"TURTLE"`           | `TURTLE`         |
| `"TTL"`              | `TURTLE`         |
| `"Turtle"`           | `TURTLE`         |
| `"N-TRIPLES"`        | `NTRIPLES`       |
| `"N-TRIPLE"`         | `NTRIPLES`       |
| `"NT"`               | `NTRIPLES`       |
| `"JSON-LD"`          | `JSONLD`         |
| `"RDF/XML-ABBREV"`   | `RDFXML`         |
| `"RDF/XML"`          | `RDFXML_PLAIN`   |
| `"N3"`               | `N3`             |
| `"RDF/JSON"`         | `RDFJSON`        |

## Formats

### Normal Printing

A `Lang` can be used for the writer format, in which case it is mapped to
an `RDFFormat` internally.  The normal writers are:

| RDFFormat or Lang | Default                 |
|-------------------|-------------------------|
| TURTLE            | Turtle, pretty printed  |
| TTL               | Turtle, pretty printed  |
| NTRIPLES          | N-Triples, UTF-8        |
| TRIG              | TriG, pretty printed    |
| NQUADS            | N-Quads, UTF-8          |
| JSONLD            | JSON-LD, pretty printed |
| RDFXML            | RDF/XML, pretty printed |
| RDFJSON           |                         |
| TRIX              |                         |
| RDFTHRFT          | RDF Binary Thrift       |
| RDFPROTO          | RDF Binary Protobuf     |

Pretty printed RDF/XML is also known as RDF/XML-ABBREV.

### Pretty Printed Languages

All Turtle and TriG formats use
prefix names, and short forms for literals.

The pretty printed versions of Turtle and TriG prints 
data with the same subject in the same graph together.
All the properties for a given subject are sorted 
into a predefined order. RDF lists are printed as
`(...)` and `[...]` is used for blank nodes where possible.  

The analysis for determining what can be pretty printed requires
temporary datastructures and also a scan of the whole graph before
writing begins.  Therefore, pretty printed formats are not suitable
for writing persistent graphs and datasets.

When writing at scale use either a "blocked" version of Turtle or TriG, 
or write N-triples/N-Quads.

Example:

    @prefix :      <http://example/> .
    @prefix dc:    <http://purl.org/dc/elements/1.1/> .
    @prefix foaf:  <http://xmlns.com/foaf/0.1/> .
    @prefix rdf:   <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
    
    :book   dc:author  ( :a :b ) .
    
    :a      a           foaf:Person ;
            foaf:knows  [ foaf:name  "Bob" ] ;
            foaf:name   "Alice" .
    
    :b      foaf:knows  :a .

Pretty printed formats:

| RDFFormat      | Same as               |
|----------------|-----------------------|
| TURTLE_PRETTY  | TURTLE, TTL           |
| TRIG_PRETTY    | TRIG                  |
| RDFXML_PRETTY  | RDFXML_ABBREV, RDFXML |

### Streamed Block Formats

Fully pretty printed formats can not be streamed.  They require analysis
of all of the data to be written in order to choose the short forms.  This limits
their use in fully scalable applications.

Some formats can be written streaming style, where the triples or quads
are partially grouped together by adjacent subject or graph/subject
in the output stream.

The written data is like the pretty printed forms of Turtle or TriG, 
but without RDF lists being written in the '(...)' form, without
using `[...]` for blank nodes.

This gives some degree of readability while not requiring
excessive temporary datastructure.  Arbitrary amounts of data 
can be written but blank node labels need to be tracked in order
to use the short label form.

Example:

    @prefix :  <http://example/> .
    @prefix dc:  <http://purl.org/dc/elements/1.1/> .
    @prefix foaf:  <http://xmlns.com/foaf/0.1/> .
    @prefix rdf:  <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
    
    :book   dc:author  _:b0 .
    
    _:b0    rdf:rest   _:b1 ;
            rdf:first  :a .
    
    :a      foaf:knows  _:b2 ;
            foaf:name   "Alice" ;
            rdf:type    foaf:Person .
    
    _:b2    foaf:name  "Bob" .
    
    :b      foaf:knows  :a .
    
    _:b1    rdf:rest   rdf:nil ;
            rdf:first  :b .
 
Formats:

| RDFFormat      |
|----------------|
| TURTLE_BLOCKS  |
| TRIG_BLOCKS    |

### Line printed formats {#line-printed-formats}

There are writers for Turtle and Trig that use the abbreviated formats for
prefix names and short forms for literals. They write each triple or quad
on a single line.

The regularity of the output can be useful for text processing of data.  
These formats do not offer more scalability than the stream forms.

Example:

The FLAT writers abbreviates IRIs, literals and blank node labels
but always writes one complete triple on one line (no use of `;`).

    @prefix :  <http://example/> .
    @prefix dc:  <http://purl.org/dc/elements/1.1/> .
    @prefix foaf:  <http://xmlns.com/foaf/0.1/> .
    @prefix rdf:  <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
    _:b0 foaf:name "Bob" .
    :book dc:author _:b1 .
    _:b2 rdf:rest rdf:nil .
    _:b2 rdf:first :b .
    :a foaf:knows _:b0 .
    :a foaf:name "Alice" .
    :a rdf:type foaf:Person .
    _:b1 rdf:rest _:b2 .
    _:b1 rdf:first :a .
    :b foaf:knows :a .

<p>&nbsp;</p>

| RDFFormat   |
|-------------|
| TURTLE_FLAT |
| TRIG_FLAT   |

### Turtle and Trig format options {#opt-turtle-trig}

Some context settings affect the output of Turtle and TriG writers. Unless
otherwise noted, the setting applies to both Turtle and TriG.

| Context setting | Cmd line | Values |
|-----------------|----------|--|
| RIOT.symTurtleDirectiveStyle | "ttl:directiveStyle" | "sparql", "rdf11", "at", "n3" |
| RIOT.symTurtleOmitBase       | "ttl:omitBase"       | "true", "false" |

<p>&nbsp;</p>

| Directive Style | Effect |
|------------------|-------|
| "sparql", "rdf11"    | Use `PREFIX` and `BASE` in output.   |
| "at", "n3"           | Use `@prefix` and `@base` in output. |
| unset                | Use `@prefix` and `@base` in output. |

<p>&nbsp;</b>

#### Format Option Usage

##### _Setting directive style_
```
    riot --set ttl:directiveStyle=sparql --pretty Turtle file1.rdf file2.nt ...
```
and in code:
```
  RDFWriter.create()
     .set(RIOT.symTurtleDirectiveStyle, "sparql")
     .lang(Lang.TTL)
     .source(model)
     .output(System.out);
```
##### _Base URI_

Output can be written with relative URIs and no base. Note: such output is not
portable; its meaning depends on the base URI at the time of reading.

Turtle and Trig can be written with relative URIs by
setting the base URI for writing and switching off output of the base URI.

```
  RDFWriter.create()
     .base("http://host/someBase")
     .set(RIOT.symTurtleOmitBase, true)
     .lang(Lang.TTL)
     .source(model)
     .output(System.out);
```

### N-Triples and N-Quads {#n-triples-and-n-quads}

These provide the formats that are fastest to write, 
and data of any size can be output.  They do not use any
internal state and formats always stream without limitation.

They maximise the 
interoperability with other systems and are useful
for database dumps. They are not human readable, 
even at moderate scale.

The files can be large but they compress well with gzip.
Compression ratios of x8-x10 can often be obtained.

Example:

The N-Triples writer makes no attempt to make it's output readable.
It uses internal blank nodes to ensure correct labeling without
needing any writer state.

    _:BX2Dc2b3371X3A13cf8faaf53X3AX2D7fff <http://xmlns.com/foaf/0.1/name> "Bob" .
    <http://example/book> <http://purl.org/dc/elements/1.1/author> _:BX2Dc2b3371X3A13cf8faaf53X3AX2D7ffe .
    _:BX2Dc2b3371X3A13cf8faaf53X3AX2D7ffd <http://www.w3.org/1999/02/22-rdf-syntax-ns#rest> <http://www.w3.org/1999/02/22-rdf-syntax-ns#nil> .
    _:BX2Dc2b3371X3A13cf8faaf53X3AX2D7ffd <http://www.w3.org/1999/02/22-rdf-syntax-ns#first> <http://example/b> .
    <http://example/a> <http://xmlns.com/foaf/0.1/knows> _:BX2Dc2b3371X3A13cf8faaf53X3AX2D7fff .
    <http://example/a> <http://xmlns.com/foaf/0.1/name> "Alice" .
    <http://example/a> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://xmlns.com/foaf/0.1/Person> .
    _:BX2Dc2b3371X3A13cf8faaf53X3AX2D7ffe <http://www.w3.org/1999/02/22-rdf-syntax-ns#rest> _:BX2Dc2b3371X3A13cf8faaf53X3AX2D7ffd .
    _:BX2Dc2b3371X3A13cf8faaf53X3AX2D7ffe <http://www.w3.org/1999/02/22-rdf-syntax-ns#first> <http://example/a> .
    <http://example/b> <http://xmlns.com/foaf/0.1/knows> <http://example/a> .

<p>&nbsp;</p>

| RDFFormat | Other names     |
|-----------|-----------------|
| NTRIPLE   | NTRIPLE, NT, NTRIPLES_UTF8 |
| NQUADS    | NQUADS, NQ, NQUADS_UTF8    |

<p>&nbsp;</p>

The main N-Triples and N-Quads writers follow RDF 1.1 and output using UTF-8.  
For compatibility with old software, writers are provided that output
in ASCII (using `\u` escape sequences for non-ASCI characters where necessary).

| RDFFormat       |
|-----------------|
| NTRIPLES_ASCII  |
| NQUADS_ASCII    |

### JSON-LD {#json-ld}

JSON-LD output is supported, in its various flavors 
("compacted", "expanded", "flattened", "framed"), 
by using one of the following RDFFormats:

| RDFFormat             |
|-----------------------|
| JSONLD_EXPAND_PRETTY  |
| JSONLD_EXPAND_FLAT    |
| JSONLD_COMPACT_PRETTY |
| JSONLD_COMPACT_FLAT   |
| JSONLD_FLATTEN_PRETTY |
| JSONLD_FLATTEN_FLAT   |
| JSONLD_FRAME_PRETTY   |
| JSONLD_FRAME_FLAT     |

The default registration for `JSONLD` is `JSONLD_PRETTY`. 
`JSONLD_PRETTY` is identical to `JSONLD_COMPACT_PRETTY`.

Output can be customized, passing more info to the writer by using the
"Context" mechanism provided by Jena.  The same mechanism is used to
pass the "frame" in the `JSONLD_FRAME_PRETTY` and `JSONLD_FRAME_FLAT`
cases.

What can be done, and how it can be, is explained in the 
[sample code](https://github.com/apache/jena/tree/main/jena-examples/src/main/java/arq/examples/arq/examples/riot/Ex_WriteJsonLD.java).

### RDF Binary {#rdf-binary}

[This is a binary encoding](rdf-binary.html) using 
[Apache Thrift](https://thrift.apache.org/) or 
[Google Protocol Buffers](https://developers.google.com/protocol-buffers)
for RDF Graphs
and RDF Datasets, as well as SPARQL Result Sets, and it provides faster parsing
compared to the text-based standardised syntax such as N-triples, Turtle or RDF/XML.

| RDFFormat         |
|-------------------|
| RDF_THRIFT        |
| RDF_THRIFT_VALUES |
| RDF_PROTO         |
| RDF_PROTO_VALUES  |

`RDF_THRIFT_VALUES` and `RDF_PROTO_VALUES` are variants where numeric values are written as values,
not as lexical format and datatype.  See the 
[description of RDF Binary](https://rdf-binary.html).
for discussion.

### RDF/XML {#rdfxml}

RIOT supports output in RDF/XML. RIOT RDFFormats defaults to pretty printed RDF/XML,
while the jena writer name defaults to a streaming plain output.

| RDFFormat | Other names              | Jena writer name            |
|-----------|--------------------------|-----------------------------|
| RDFXML    | RDFXML_PRETTY, RDF_XML_ABBREV | "RDF/XML-ABBREV" |
| RDFXML_PLAIN |                            | "RDF/XML"        |

## Examples {#examples}

Example code may be found in [jena-examples:arq/examples](https://github.com/apache/jena/tree/main/jena-examples/src/main/java/arq/examples/arq/examples/riot/).

### Ways to write a model

The follow ways are different ways to write a model in Turtle:

        Model model =  ... ;

        // Write a model in Turtle syntax, default style (pretty printed)
        RDFDataMgr.write(System.out, model, Lang.TURTLE) ;
        
        // Write Turtle to the blocks variant
        RDFDataMgr.write(System.out, model, RDFFormat.TURTLE_BLOCKS) ;
        
        // Write as Turtle via model.write
        model.write(System.out, "TTL") ;

### Ways to write a dataset

The preferred style is to use `RDFDataMgr`:

    Dataset ds = .... ;
    // Write as TriG
    RDFDataMgr.write(System.out, ds, Lang.TRIG) ;

    // Write as N-Quads
    RDFDataMgr.write(System.out, dataset, Lang.NQUADS) ;

Additionally, a single model can be written in a dataset format - it becomes
the default graph of the dataset.
    
    Model m = ... ;
    RDFDataMgr.write(System.out, m, Lang.TRIG) ;

might give:

    @prefix :      <http://example/> .
    @prefix dc:    <http://purl.org/dc/elements/1.1/> .
    @prefix foaf:  <http://xmlns.com/foaf/0.1/> .
    @prefix rdf:   <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .

    {
        :book   dc:author  ( :a :b ) .

        :a      a           foaf:Person ;
                foaf:knows  [ foaf:name  "Bob" ] ;
                foaf:name   "Alice" .

        :b      foaf:knows  :a .
    }

### Adding a new output format

A complete example of adding a new output format is given in the example file: 
[RIOT Output example 7](https://github.com/apache/jena/blob/main/jena-examples/src/main/java/arq/examples/arq/examples/riot/ExRIOT7_AddNewWriter.java).

## Notes {#notes}

Using `OutputStream`s is strongly encouraged.  This allows the writers
to manage the character encoding using UTF-8.  Using `java.io.Writer` 
does not allow this; on platforms such as MS Windows, the default
configuration of a `Writer` is not suitable for Turtle because
the character set is the platform default, and not UTF-8.
The only use of writers that is useful is using `java.io.StringWriter`.
