---
title: Apache Jena SHACL
slug: index
---

`jena-shacl` is an implementation of the 
W3C [Shapes Constraint Language (SHACL)](https://www.w3.org/TR/shacl/).
It implements SHACL Core and SHACL SPARQL Constraints.

In addition, it provides:
* [SHACL Compact Syntax](#shacl-compact-syntax)
* [SPARQL-based targets](#sparql-based-targets)

## Command line

The command `shacl` introduces shacl operations; it takes a sub-command
argument.

To validate:

<pre>shacl validate --shapes <i>SHAPES.ttl</i> --data <i>DATA.ttl</i></pre>
<pre>shacl v -s <i>SHAPES.ttl</i> -d <i>DATA.ttl</i></pre>

The shapes and data files can be the same; the `--shapes` is optional and
defaults to the same as `--data`.  This includes running individual W3C Working
Group tests.

To parse a file:

<pre>shacl parse <i>FILE</i></pre>
<pre>shacl p <i>FILE</i></pre>

which writes out a text format.

<pre>shacl p <i>--out=FMT</i> <i>FILE</i></pre>

writes out in `text`(`t`), `compact`(`c`), `rdf`(`r`) formats. Multiple formats can be given,
separated by "," and format `all` outputs all 3 formats.

## Integration with Apache Jena Fuseki

Fuseki has a new service operation `fuseki:shacl`:

<pre>
&lt;#serviceWithShacl&gt; rdf:type fuseki:Service ;
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

Further, an argument <tt>target=<i>uri</i></tt> validates a specific node in the data.

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

https://github.com/apache/jena/tree/main/jena-examples/src/main/java/shacl/examples/

Example
[`Shacl01_validateGraph`](
https://github.com/apache/jena/tree/main/jena-shacl/src/main/java/org/apache/jena/shacl/examples/Shacl01_validateGraph.java)
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
[`Shacl02_validateTransaction`](https://github.com/apache/jena/tree/main/jena-shacl/src/main/java/org/apache/jena/shacl/examples/Shacl02_validateTransaction.java)
shows how to update a graph only if, after the changes, the graph is validated
according to the shapes provided.

## SHACL Compact Syntax

Apache Jena supports
[SHACL Compact Syntax (SHACL-C)](https://w3c.github.io/shacl/shacl-compact-syntax/)
for both reading and writing.

The file extensions for SHACL-C are `.shc` and `.shaclc` and there is a registered language
constant `Lang.SHACLC`.

    RDFDataMgr.load("shapes.shc");

    RDFDataMgr.read("file:compactShapes", Lang.SHACLC);

    RDFDataMgr.write(System.out, shapesGraph, Lang.SHACLC);

SHACL-C is managed by the SHACL Community Group. It does not cover all possible shapes.
When outputting SHACL-C, SHACL shapes not expressible in SHACL-C will cause an
exception and data in the RDF graph that is not relevant will not be output. In
other words, SHACL-C is a lossy format for RDF.

The Jena SHACL-C writer will output any valid SHACL-C document.

Extensions:

* The `constraint` grammar rule allows a shape reference to a node shape.
* The `propertyParam` grammar rule provides "group", "order", "name",
  "description" and "defaultValue" to align with `nodeParam`.
* The `nodeParam` grammar rule supports "targetClass" (normally written 
  with the shorthand `->`) as well as the defined
  "targetNode", "targetObjectsOf", "targetSubjectsOf"

## SPARQL-based targets

SPARQL-based targets allow the target nodes to be calculated with a SPARQL
`SELECT` query.

See [SPARQL-based targets](https://w3c.github.io/shacl/shacl-af/#SPARQLTarget)
for details.

```
ex:example
    sh:target [
        a sh:SPARQLTarget ;
        sh:select """
            SELECT ?this
            WHERE {
              ...
            }
            """ ;
    ] ;
```
## ValidationListener

When given a `ValidationListener` the SHACL validation code emits events at each step of validation:
* when validation of a shape starts or finishes
* when the focus nodes of the shape have been identified
* when validation of a constraint begins, ends and yields positive or negative results

For example, the following listener will just record all events in a List:
```
public class RecordingValidationListener implements ValidationListener {
        private final List<ValidationEvent> events = new ArrayList<>();

        @Override public void onValidationEvent(ValidationEvent e) {
            events.add(e);
        }

        public List<ValidationEvent> getEvents() {
            return events;
        }
    }
```
The listener must be passed to the constructor of the `ValidationContext`. 
The following example validates the `dataGraph` according to the `shapesGraph` using the ValidationListener above:
```
    Graph shapesGraph = RDFDataMgr.loadGraph(shapesGraphUri); //assuming shapesGraphUri points to an RDF file
    Graph dataGraph = RDFDataMgr.loadGraph(dataGraphUri); //assuming dataGraphUri points to an RDF file
    RecordingValidationListener listener = new RecordingValidationListener();  // see above
    Shapes shapes = Shapes.parse(shapesGraph);
    ValidationContext vCtx = ValidationContext.create(shapes, dataGraph, listener); // pass listener here
    for (Shape shape : shapes.getTargetShapes()) {
        Collection<Node> focusNodes = VLib.focusNodes(dataGraph, shape);
        for (Node focusNode : focusNodes) {
            VLib.validateShape(vCtx, dataGraph, shape, focusNode);
        }
    }
    List<ValidationEvent> actualEvents = listener.getEvents(); // all events have been recorded
```        

The events thus generated might look like this (`event.toString()`, one per line):
```
 FocusNodeValidationStartedEvent{focusNode=http://datashapes.org/sh/tests/core/node/class-001.test#Someone, shape=NodeShape[http://datashapes.org/sh/tests/core/node/class-001.test#TestShape]}
 ConstraintEvaluationForNodeShapeStartedEvent{constraint=ClassConstraint[<http://datashapes.org/sh/tests/core/node/class-001.test#Person>], focusNode=http://datashapes.org/sh/tests/core/node/class-001.test#Someone, shape=NodeShape[http://datashapes.org/sh/tests/core/node/class-001.test#TestShape]}
 ConstraintEvaluatedOnFocusNodeEvent{constraint=ClassConstraint[<http://datashapes.org/sh/tests/core/node/class-001.test#Person>], focusNode=http://datashapes.org/sh/tests/core/node/class-001.test#Someone, shape=NodeShape[http://datashapes.org/sh/tests/core/node/class-001.test#TestShape], valid=true}
 ConstraintEvaluationForNodeShapeFinishedEvent{constraint=ClassConstraint[<http://datashapes.org/sh/tests/core/node/class-001.test#Person>], focusNode=http://datashapes.org/sh/tests/core/node/class-001.test#Someone, shape=NodeShape[http://datashapes.org/sh/tests/core/node/class-001.test#TestShape]}
 FocusNodeValidationFinishedEvent{focusNode=http://datashapes.org/sh/tests/core/node/class-001.test#Someone, shape=NodeShape[http://datashapes.org/sh/tests/core/node/class-001.test#TestShape]}
[...]    
```
Many use cases can be addressed with the `HandlerBasedValidationListener`, which allows for registering event handlers on a per-event basis. 
For example:
```
    ValidationListener myListener = HandlerBasedValidationListener
        .builder()
        .forEventType(FocusNodeValidationStartedEvent.class)
        .addSimpleHandler(e -> {
           // ... 
        })
        .forEventType(ConstraintEvaluatedEvent.class)
        .addHandler(c -> c
            .iff(EventPredicates.isValid()) // use a Predicate<ValidationEvent> to select events
            .handle(e -> {
                // ...
            })
        )
        .build();
```
