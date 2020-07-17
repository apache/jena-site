---
title: Apache Jena Shacl
slug: index
---

jena-shacl is an implementation of the 
W3C [Shapes Constraint Language (SHACL)](https://www.w3.org/TR/shacl/).
It implements SHACL Core and SHACL SPARQL Constraints.

## Command line

The command `shacl` introduces shacl operations; it takes a sub-command
argument. 

To validate:

<pre>shacl validate --shapes <i>SHAPES.ttl</i> --data <i>DATA.ttl</i></pre>
<pre>shacl v -s <i>SHAPES.ttl</i> -d <i>DATA.ttl</i></pre>

The shapes and data files can be the same; the `--shapes` is optional and
default to the same as `--data`.  This includes running individual W3C Working
Group tests.

To parse a file

<pre>shacl parse <i>FILE</i></pre>
<pre>shacl p <i>FILE</i></pre>

which writes out a text format.

## Integration with Apache Jena Fuseki

Fuseki has a new service operation `fuseki:shacl`:

<pre>
&lt;#serviceInMemoryShacl&gt; rdf:type fuseki:Service ;
    rdfs:label                   "Dataset with SHACL validation" ;
    fuseki:name                  "<i>ds</i>" ;
    fuseki:serviceReadWriteGraphStore "" ;
    fuseki:endpoint [ fuseki:operation fuseki:shacl ; fuseki:name "shacl" ] ;
    fuseki:dataset &lt;#dataset&gt; ;
    .
</pre>

This requires a "new style" endpoint declaration:  see
"[Fuseki Endpoint Configuration](/documentation/fuseki2/fuseki-config-endpoint.html)".

This is not installed into a dataset setup by default; a configuration file using
```
fuseki:endpoint [ fuseki:operation fuseki:shacl ;
                  fuseki:name "shacl" ];
```
is necessary (or programmatic setup for Fuseki Main).

The service accepts a shapes graph posted as RDF to <tt>/<i>ds</i>/shacl</tt> with
content negotiation.

There is a graph argument, `?graph=`, that specifies the graph to validate. It
is the URI of a named graph, `default` for the unnamed, default graph (and
this is the assumed value of `?graph` if not present), or `union` for union of
all named graphs in the dataset.

Upload data in file `fu-data.ttl`:

    curl -XPOST --data-binary @fu-data.ttl    \  
         --header 'Content-type: text/turtle' \  
         'http://localhost:3030/ds?default'

Validate with shapes in `fu-shapes.ttl` and get back a validation report:

    curl -XPOST --data-binary @fu-shapes.ttl  \  
         --header 'Content-type: text/turtle' \  
         'http://localhost:3030/ds/shacl?graph=default'

## API

The package `org.apache.jena.shacl` has the main classes.

* `ShaclValidator` for parsing and validation
* `GraphValidation` for updating graphs with validation

## API Examples

https://github.com/apache/jena/tree/master/jena-shacl/src/main/java/org/apache/jena/shacl/examples

Example
[`Shacl01_validateGraph`](
https://github.com/apache/jena/tree/master/jena-shacl/src/main/java/org/apache/jena/shacl/examples/Shacl01_validateGraph.java)
shows validation and printing of the validation report in a text form and in RDF:

    public static void main(String ...args) {
        String SHAPES = "shapes.ttl";
        String DATA = "data1.ttl";

        Graph shapesGraph = RDFDataMgr.loadGraph(SHAPES);
        Graph dataGraph = RDFDataMgr.loadGraph(DATA);

        Shapes shapes = Shapes.parse(shapesGraph);

        ValidationReport report = ShaclValidator.get().validate(shapes, dataGraph);
        ShLib.printReport(report);
        System.out.println();
        RDFDataMgr.write(System.out, report.getModel(), Lang.TTL);
    }

Example
[`Shacl02_validateTransaction`](https://github.com/apache/jena/tree/master/jena-shacl/src/main/java/org/apache/jena/shacl/examples/Shacl02_validateTransaction.java)
shows how to update a graph only if, after the changes, the graph is validated
according to the shapes provided.

## SHACL Compact Syntax

Jena can read 
[SHACL Compact Syntax](https://w3c.github.io/shacl/shacl-compact-syntax/).
The file extensions are `.shc` and `.shaclc` and there is a registered language
constant `Lang.SHACLC`.

    RDFDataMgr.load("shapes.shc");

    RDFDataMgr.read("file:compactShapes", Lang.SHACLC);
