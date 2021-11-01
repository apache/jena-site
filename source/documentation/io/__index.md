---
title: Reading and Writing RDF in Apache Jena
slug: index
---

This page details the setup of RDF I/O technology (RIOT).

* [Formats](#formats)
* [Commands](#command-line-tools)
* [Reading RDF in Jena](rdf-input.html)
* [Writing RDF in Jena](rdf-output.html)
* [Working with RDF Streams](streaming-io.html)
* [Additional details on working with RDF/XML](rdfxml_howto.html)

## Formats

The following RDF formats are supported by Jena. In addition, other syntaxes
can be integrated into both the parser and writer registries.

- Turtle
- RDF/XML
- N-Triples
- JSON-LD
- RDF/JSON
- TriG
- N-Quads
- TriX
- RDF Binary

RDF/JSON is different from JSON-LD - it is a direct encoding of RDF triples in JSON.
See the [description of RDF/JSON](rdf-json.html).

See "[Reading JSON-LD 1.1](json-ld-11.html)" for additional setup and use for
reading JSON-LD 1.1. JSON-LD 1.0 is the current default in Jena.

RDF Binary is a binary encoding of RDF (graphs and datasets) that can be useful
for fast parsing.  See [RDF Binary](rdf-binary.html).

## Command line tools

There are scripts in Jena download to run these commands.

- `riot` - parse, guessing the syntax from the file extension.
    Assumes N-Quads/N-Triples from stdin.
- `turtle`, `ntriples`, `nquads`, `trig`, `rdfxml` - parse a particular language

These can be called directly as Java programs:

The file extensions understood are:

| &nbsp;Extension&nbsp; |&nbsp; Language&nbsp; |
|-----------|--------------|
| `.ttl`    | Turtle       |
| `.nt`     | N-Triples    |
| `.nq`     | N-Quads      |
| `.trig`   | TriG         |
| `.rdf`    | RDF/XML      |
| `.owl`    | RDF/XML      |
| `.jsonld` | JSON-LD      |
| `.trdf`   | RDF Thrift   |
| `.rt`     | RDF Thrift   |
| `.rpb     | RDF Protobuf |
| `.pbrdf`  | RDF Protobuf |
| `.rj`     | RDF/JSON     |
| `.trix`   | TriX         |

`.n3` is supported but only as a synonym for Turtle.

The [TriX](trix.html) support is for the core TriX format.

In addition, if the extension is `.gz` the file is assumed to be gzip
compressed. The file name is examined for an inner extension. For
example, `.nt.gz` is gzip compressed N-Triples.

Jena does not support all possible compression formats itself, only
GZip and BZip2 are supported directly.  If you want to use an 
alternative compression format you can do so by piping the output of the
relevant decompression utility into one of Jena's commands e.g.

    zstd -d < FILE.nq.zst | riot --syntax NQ ...

These scripts call java programs in the `riotcmd` package. For example:

    java -cp ... riotcmd.riot file.ttl

This can be a mixture of files in different syntaxes when file extensions
are used to determine the file syntax type.

The scripts all accept the same arguments (type `"riot --help"` to
get command line reminders):

-   `--syntax=NAME`; Explicitly set the input syntax for all files.
-   `--validate`: Checking mode: same as `--strict --sink --check=true`.
-   `--check=true/false`: Run with checking of literals and IRIs either on or off.
-   `--time`: Output timing information.
-   `--sink`: No output.
-   `--output=FORMAT`: Output in a given syntax (streaming if possible).
-   `--formatted=FORMAT`: Output in a given syntax, using pretty printing.
-   `--stream=FORMAT`: Output in a given syntax, streaming (not all syntaxes can be streamed).


To aid in checking for errors in UTF8-encoded files, there is a
utility which reads a file of bytes as UTF8 and checks the encoding.

-   `utf8` -- read bytes as UTF8

## Inference

RIOT support creation of inferred triples during the parsing
process:

    riotcmd.infer --rdfs VOCAB FILE FILE ...

Output will contain the base data and triples inferred based on
RDF subclass, subproperty, domain and range declarations.
