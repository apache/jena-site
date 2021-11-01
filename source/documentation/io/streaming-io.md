---
title: Working with RDF Streams in Apache Jena
---

Jena has operations useful in processing RDF in a streaming
fashion. Streaming can be used for manipulating RDF at scale.  Jena
provides high performance readers and writers for all standard RDF formats,
and it can be extended with custom formats.

The [RDF Binary](rdf-binary.html) provides the highest
input parsing performance. N-Triples/N-Quads provide the highest
input parsing performance using W3C Standards.

Files ending in `.gz` are assumed to be gzip-compressed. Input and output
to such files takes this into account, including looking for the other file
extension.  `data.nt.gz` is parsed as a gzip-compressed N-Triples file.

Jena does not support all possible compression formats itself, only
GZip and BZip2 are supported directly.  If you want to use an 
alternative compression format you can do so by adding suitable dependencies
into your project and passing an appropriate `InputStream`/`OutputStream` 
implementation to Jena code e.g.

    InputStream input =  new ZstdCompressorInputStream(....);
    RDFParser.source(input).lang(Lang.NQ).parse(graph);

## StreamRDF

The central abstraction is 
[`StreamRDF`](/documentation/javadoc/arq/org/apache/jena/riot/system/StreamRDF.html)
which is an interface for streamed RDF data.  It covers triples and quads, 
and also parser events for prefix settings and base URI declarations.

    public interface StreamRDF {
        /** Start processing */
        public void start() ;
   
        /** Triple emitted */
        public void triple(Triple triple) ;

        /** Quad emitted */
        public void quad(Quad quad) ;

        /** base declaration seen */
        public void base(String base) ;

        /** prefix declaration seen */
        public void prefix(String prefix, String iri) ;

        /** Finish processing */
        public void finish() ;
    }

There are utilities to help:

* [`StreamRDFLib`](/documentation/javadoc/arq/org/apache/jena/riot/system/StreamRDFLib.html) &ndash; create `StreamRDF` objects
* [`StreamRDFOps`](/documentation/javadoc/arq/org/apache/jena/riot/system/StreamRDFOps.html) &ndash; helpers for sending RDF data to `StreamRDF` objects

## Reading data

All parsers of RDF syntaxes provided by RIOT are streaming with the
exception of JSON-LD.  A JSON object can have members in any order so the
parser may need the whole top-level object in order to have the information
needed for parsing.

The [`parse` functions](/documentation/javadoc/arq/org/apache/jena/riot/RDFDataMgr.html#parse%28org.apache.jena.riot.system.StreamRDF%2C%20java.io.InputStream%2C%20org.apache.jena.riot.Lang%29)
of [RDFDataMgr](/documentation/javadoc/arq/org/apache/jena/riot/RDFDataMgr.html) 
directs the output of the parser to a `StreamRDF`.  For example:

    StreamRDF destination = ... 
    RDFDataMgr.parse(destination, "http://example/data.ttl") ;

The above code reads the remote URL, with content negotiation, and sends the
triples to the `destination`.

## Writing data

Not all RDF formats are suitable for writing as a stream.  Formats that
provide pretty printing (for example the default `RDFFormat` for each of
Turtle, TriG and RDF/XML) require analysis of the entire model in order
to determine nestable structures of blank nodes and for using specific
syntax for RDF lists.

These languages can be used for streaming output but with an appearance
that is necessarily "less pretty".
See ["Streamed Block Formats"](rdf-output.html#streamed-block-formats) 
for details.

The [`StreamRDFWriter`](/documentation/javadoc/arq/org/apache/jena/riot/system/StreamRDFWriter.html)
class has functions that write graphs and datasets
using a streaming writer and also provides for the creation of
an `StreamRDF` backed by a stream-based writer

    StreamRDFWriter.write(output, model.getGraph(), lang) ;

which can be done as:

    StreamRDF writer = StreamRDFWriter.getWriterStream(output, lang) ;
    StreamRDFOps.graphToStream(writer, model.getGraph()) ;

N-Triples and N-Quads are always written as a stream.

## RDFFormat and Lang

| [RDFFormat](/documentation/javadoc/arq/org/apache/jena/riot/RDFFormat.html) | [Lang](/documentation/javadoc/arq/org/apache/jena/riot/Lang.html) shortcut  |
|----------------------------|------------------|
| `RDFFormat.TURTLE_BLOCKS`  | `Lang.TURTLE`    |
| `RDFFormat.TURTLE_FLAT`    |                  |
| `RDFFormat.TRIG_BLOCKS`    | `Lang.TRIG`      |
| `RDFFormat.TRIG_FLAT`      |                  |
| `RDFFormat.NTRIPLES_UTF8`  | `Lang.NTRIPLES`  |
| `RDFFormat.NTRIPLES_ASCII` |                  |
| `RDFFormat.NQUADS_UTF8`    | `Lang.NQUADS`    |
| `RDFFormat.NQUADS_ASCII`   |                  |
| `RDFFormat.TRIX`           | `Lang.TRIX`      |
| `RDFFormat.RDF_THRIFT`     | `Lang.RDFTHRIFT` |
| `RDFFormat.RDF_PROTO`      | `Lang.RDFPROTO`  |
