---
title: Apache Jena ShEx
slug: index
---

`jena-shex` is an implementation of the 
[ShEx (Shape Expressions)](https://shex.io) language.

<p>
<i>This implementation is experimental, starting with Jena 4.2.0.
Please send usage reports and experience to </i>
<tt>users@jena.apache.org</tt>.
</p>

## Status

`jena-shex` reads ShExC (the compact syntax) files.

Not currently supported:
* semantic actions
* `EXTERNAL`

Blank node label validation is meaningless in Jena because a blank node label is
scoped to the file, and not retained after the file has been read.

## Command line

The command `shex` introduces shex operations; it takes a sub-command
argument.

To validate:

<pre>shex validate --schema SCHEMA.shex --map MAP.shexmap --data DATA.ttl</pre>
<pre>shex v -s SCHEMA.shex -m MAp.shexmap -d data.ttl</pre>

To parse a file:

<pre>shex parse <i>FILE</i></pre>
<pre>shex p <i>FILE</i></pre>

which writes out the parser results in a text format.

<!--
<pre>shex p <i>--out=FMT</i> <i>FILE</i></pre>
writes out in `text`(`t`), `compact`(`c`), `rdf`(`r`) formats. Multiple formats
can be given, separated by "," and format `all` outputs all 3 formats.
-->

## API

The package `org.apache.jena.shex` has the main classes.

* `Shex` for reading ShEx related formats.
* `ShexValidation` for validation.

## API Examples

Examples:

https://github.com/apache/jena/tree/main/jena-examples/src/main/java/shex/examples/

```
    public static void main(String ...args) {
        String SHAPES     = "examples/schema.shex";
        String SHAPES_MAP = "examples/shape-map.shexmap";
        String DATA       = "examples/data.ttl";

        System.out.println("Read data");
        Graph dataGraph = RDFDataMgr.loadGraph(DATA);

        System.out.println("Read schema");
        ShexSchema shapes = Shex.readSchema(SHAPES);

        // Shapes map.
        System.out.println("Read shapes map");
        ShexMap shapeMap = Shex.readShapeMap(SHAPES_MAP);

        // ShexReport
        System.out.println("Validate");
        ShexReport report = ShexValidator.get().validate(dataGraph, shapes, shapeMap);

        System.out.println();
        // Print report.
        ShexLib.printReport(report);
    }
```
