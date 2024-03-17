---
title: SAX Input into Jena and ARP
---

___Legacy Documentation : not up-to-date___

___The original ARQ parser will be removed from Jena___

---

Normally, both ARP and Jena are used to read files either from the
local machine or from the Web. A different use case, addressed
here, is when the XML source is available in-memory in some way. In
these cases, ARP and Jena can be used as a SAX event handler,
turning SAX events into triples, or a DOM tree can be parsed into a
Jena Model.

## 1. Overview

To read an arbitrary SAX source as triples to be added into a Jena
model, it is not possible to use a
`Model.`[`read`](/documentation/javadoc/jena/org.apache.jena.core/org/apache/jena/rdf/model/Model.html#read(java.io.InputStream,%20java.lang.String))()
operation. Instead, you construct a SAX event handler of class
[`SAX2Model`](/documentation/javadoc/jena/org.apache.jena.core/org/apache/jena/rdf/arp/SAX2Model.html),
using the
[`create`](/documentation/javadoc/jena/org.apache.jena.core/org/apache/jena/rdf/arp/SAX2Model.html#create(java.lang.String,%20org.apache.jena.rdf.model.Model))
method, install these as the handler on your SAX event source, and
then stream the SAX events. It is possible to have fine-grained
control over the SAX events, for instance, by inserting or deleting
events, before passing them to the
[`SAX2Model`](/documentation/javadoc/jena/org.apache.jena.core/org/apache/jena/rdf/arp/SAX2Model.html)
handler.

## Sample Code

This code uses the Xerces parser as a SAX event stream, and adds
the triple to a
[`Model`](/documentation/javadoc/jena/org.apache.jena.core/org/apache/jena/rdf/model/Model.html) using
default options.

    // Use your own SAX source.
    XMLReader saxParser = new SAXParser();

    // set up SAX input
    InputStream in = new FileInputStream("kb.rdf");
    InputSource ins = new InputSource(in);
    ins.setSystemId(base);

    Model m = ModelFactory.createDefaultModel();
    String base = "http://example.org/";

    // create handler, linked to Model
    SAX2Model handler = SAX2Model.create(base, m);

    // install handler on SAX event stream
    SAX2RDF.installHandlers(saxParser, handler);

    try {
        try {
            saxParser.parse(ins);
        } finally {
            // MUST ensure handler is closed.
            handler.close();
        }
    } catch (SAXParseException e) {
        // Fatal parsing errors end here,
        // but they will already have been reported.
    }

## Initializing SAX event source

If your SAX event source is a subclass of `XMLReader`, then the
[installHandlers](/documentation/javadoc/jena/org.apache.jena.core/org/apache/jena/rdf/arp/SAX2RDF.html#installHandlers(org.xml.sax.XMLReader,%20org.apache.jena.rdf.arp.XMLHandler))
static method can be used as shown in the sample. Otherwise, you
have to do it yourself. The
[`installHandlers`](/documentation/javadoc/jena/org.apache.jena.core/org/apache/jena/rdf/arp/SAX2RDF.html#installHandlers(org.xml.sax.XMLReader,%20org.apache.jena.rdf.arp.XMLHandler))
code is like this:

    static public void installHandlers(XMLReader rdr, XMLHandler sax2rdf)
    throws SAXException
    {
        rdr.setEntityResolver(sax2rdf);
        rdr.setDTDHandler(sax2rdf);
        rdr.setContentHandler(sax2rdf);
        rdr.setErrorHandler(sax2rdf);
        rdr.setFeature("http://xml.org/sax/features/namespaces", true);
        rdr.setFeature(
                "http://xml.org/sax/features/namespace-prefixes",
                true);
        rdr.setProperty(
                "http://xml.org/sax/properties/lexical-handler",
                sax2rdf);
    }

For some other SAX source, the exact code will differ, but the
required operations are as above.

## Error Handler

The [SAX2Model](/documentation/javadoc/jena/org.apache.jena.core/org/apache/jena/rdf/arp/SAX2Model.html)
handler supports the
[setErrorHandler](/documentation/javadoc/jena/org.apache.jena.core/org/apache/jena/rdf/model/RDFReader.html#setErrorHandler(org.apache.jena.rdf.model.RDFErrorHandler))
method, from the Jena
[RDFReader](/documentation/javadoc/jena/org.apache.jena.core/org/apache/jena/rdf/model/RDFReader.html)
interface. This is used in the same way as that method to control
error reporting.

A specific fatal error, new in Jena 2.3, is ERR\_INTERRUPTED, which
indicates that the current Thread received an interrupt. This
allows long jobs to be aborted on user request.

## Options

The [`SAX2Model`](/documentation/javadoc/jena/org.apache.jena.core/org/apache/jena/rdf/arp/SAX2Model.html)
handler supports the
[`setProperty`](/documentation/javadoc/jena/org.apache.jena.core/org/apache/jena/rdf/model/RDFReader.html#setProperty(java.lang.String,%20java.lang.Object))
method, from the Jena
[`RDFReader`](/documentation/javadoc/jena/org.apache.jena.core/org/apache/jena/rdf/model/RDFReader.html)
interface. This is used in nearly the same way to have fine grain
control over ARPs behaviour, particularly over error reporting, see
the [I/O howto](iohowto.html#arp_properties). Setting SAX or
Xerces properties cannot be done using this method.

## XML Lang and Namespaces

If you are only treating some document subset as RDF/XML then it is
necessary to ensure that ARP knows the correct value for `xml:lang`
and desirable that it knows the correct mappings of namespace
prefixes.

There is a second version of the
[`create`](/documentation/javadoc/jena/org.apache.jena.core/org/apache/jena/rdf/arp/SAX2Model.html#create(java.lang.String,%20org.apache.jena.rdf.model.Model,%20java.lang.String))
method, which allows specification of the `xml:lang` value from the
outer context. If this is inappropriate it is possible, but hard
work, to synthesis an appropriate SAX event.

For the namespaces prefixes, it is possible to call the
[`startPrefixMapping`](/documentation/javadoc/jena/org.apache.jena.core/org/apache/jena/rdf/arp/SAX2RDF.html#startPrefixMapping(java.lang.String,%20java.lang.String))
SAX event, before passing the other SAX events, to declare each
namespace, one by one. Failure to do this is permitted, but, for
instance, a Jena Model will then not know the (advisory) namespace
prefix bindings. These should be paired with endPrefixMapping
events, but nothing untoward is likely if such code is omitted.

## Using your own triple handler

As with ARP, it is possible to use this functionality, without
using other Jena features, in particular, without using a Jena
Model. Instead of using the class SAX2Model, you use its superclass
[SAX2RDF](/documentation/javadoc/jena/org.apache.jena.core/org/apache/jena/rdf/arp/SAX2RDF.html). The
[create](/documentation/javadoc/jena/org.apache.jena.core/org/apache/jena/rdf/arp/SAX2RDF.html#create(java.lang.String))
method on this class does not provide any means of specifying what
to do with the triples. Instead, the class implements the
[ARPConfig](/documentation/javadoc/jena/org.apache.jena.core/org/apache/jena/rdf/arp/SAX2RDF.html)
interface, which permits the setting of handlers and parser
options, as described in the documentation for using
[ARP without Jena](standalone.html).

Thus you need to:

1.  Create a SAX2RDF using
    [SAX2RDF.create()](/documentation/javadoc/jena/org.apache.jena.core/org/apache/jena/rdf/arp/SAX2RDF.html#create(java.lang.String))
2.  Attach your StatementHandler and SAXErrorHandler and optionally
    your NamespaceHandler and ExtendedHandler to the SAX2RDF instance.
3.  Install the SAX2RDF instance as the SAX handler on your SAX
    source.
4.  Follow the remainder of the code sample above.

## Using a DOM as Input

None of the approaches listed here work with Java 1.4.1\_04. We
suggest using Java 1.4.2\_04 or greater for this functionality.
This issue has no impact on any other Jena functionality.

### Using a DOM as Input to Jena

The [`DOM2Model`](/documentation/javadoc/jena/org.apache.jena.core/org/apache/jena/rdf/arp/DOM2Model.html)
subclass of SAX2Model, allows the parsing of a DOM using ARP. The
procedure to follow is:

-   Construct a `DOM2Model`, using a factory method such as
    [`createD2M`](/documentation/javadoc/jena/org.apache.jena.core/org/apache/jena/rdf/arp/DOM2Model.html#createD2M(java.lang.String,%20org.apache.jena.rdf.model.Model)),
    specifying the xml:base of the document to be loaded, the Model to
    load into, optionally the xml:lang value (particularly useful if
    using a DOM Node from within a Document).
-   Set any properties, error handlers etc. on the `DOM2Model`
    object.
-   The DOM is parsed simply by calling the
    [`load(Node)`](/documentation/javadoc/jena/org.apache.jena.core/org/apache/jena/rdf/arp/DOM2Model.html#load(org.w3c.dom.Node))
    method.

### Using a DOM as Input to ARP

DOM2Model is a subclass of SAX2RDF, and handlers etc. can be set on
the DOM2Model as for SAX2RDF. Using a null model as the argument to
the factory indicates this usage.
